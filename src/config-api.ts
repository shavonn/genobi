import path from "node:path";
import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import Handlebars from "handlebars";
import { store } from "./config-store";
import { GenobiError } from "./errors";
import type { ConfigAPI } from "./types/config-api";
import type { GeneratorConfig } from "./types/generator";
import { fileSys } from "./utils/file-sys";
import { logger } from "./utils/logger";
import { validation } from "./utils/validation";

/**
 * Creates and returns the Genobi configuration API.
 * This API is used to configure generators, helpers, and other options.
 *
 * @returns {ConfigAPI} The Genobi configuration API object
 */
function configApi(): ConfigAPI {
	return {
		/**
		 * Sets the path to the configuration file.
		 * This is used internally by Genobi and typically doesn't need to be called
		 * in user configuration files.
		 *
		 * @param {string} configFilePath - The absolute path to the config file
		 */
		setConfigFilePath: store.setConfigFilePath,

		/**
		 * Returns the current configuration file path.
		 *
		 * @returns {string} The absolute path to the config file
		 */
		getConfigFilePath: (): string => store.state().configFilePath,

		/**
		 * Sets the base directory path used for generating files.
		 * All relative paths in operations will be resolved from this path.
		 *
		 * @param {string} destinationPath - TThe base directory path for file operations
		 */
		setDestinationBasePath: store.setDestinationBasePath,

		/**
		 * Returns the base directory path used for generating files.
		 * All relative paths in operations will be resolved from this path.
		 *
		 * @returns {string} The base directory path for file operations
		 */
		getDestinationBasePath: (): string => store.state().destinationBasePath,

		/**
		 * Sets the prompt message displayed during generator selection.
		 *
		 * @param {string} message - The prompt message to display
		 */
		setSelectionPrompt: store.setSelectionPrompt,

		/**
		 * Returns the current generator selection prompt message.
		 *
		 * @returns {string} The prompt message
		 */
		getSelectionPrompt: (): string => store.state().selectionPrompt,

		/**
		 * Adds a new generator to the configuration.
		 *
		 * @param {string} id - Unique identifier for the generator
		 * @param {GeneratorConfig} generator - The generator configuration
		 * @throws {GenobiError} If validation fails
		 */
		addGenerator: (id: string, generator: GeneratorConfig): void => {
			try {
				// Validate the generator configuration
				validation.validateGenerator(id, generator);

				// Check if generator with this ID already exists
				if (store.state().generators.has(id)) {
					logger.warn(`Generator "${id}" already exists and will be overwritten`);
				}

				// Store the generator
				store.setGenerator(id, generator);
				logger.info(`Generator "${id}" registered successfully`);
			} catch (err: any) {
				logger.error(`Failed to add generator "${id}": ${err.message}`);
				throw err;
			}
		},

		/**
		 * Returns a specific generator by ID.
		 *
		 * @param {string} generatorId - The ID of the generator to retrieve
		 * @returns {GeneratorConfig} The generator configuration
		 * @throws {GenobiError} If the generator is not found
		 */
		getGenerator: (generatorId: string): GeneratorConfig => {
			const generator = store.state().generators.get(generatorId);
			if (!generator) {
				throw new GenobiError("GENERATOR_NOT_FOUND", `Generator "${generatorId}" not found in loaded configuration.`);
			}
			return generator;
		},

		/**
		 * Returns all registered generators.
		 *
		 * @returns {Record<string, GeneratorConfig>} An object containing all registered generators, keyed by ID
		 */
		getGenerators: (): Record<string, GeneratorConfig> => Object.fromEntries(store.state().generators),

		/**
		 * Adds a custom Handlebars helper function.
		 *
		 * @param {string} name - The name of the helper
		 * @param {HelperDelegate} helper - The helper function implementation
		 * @throws {ValidationError} If validation fails
		 */
		addHelper: (name: string, helper: HelperDelegate): void => {
			try {
				// Validate the helper
				validation.validateHelper(name, helper);

				// Check if helper with this name already exists
				if (store.state().helpers.has(name)) {
					logger.warn(`Helper "${name}" already exists and will be overwritten`);
				}

				// Store and register the helper
				store.setHelper(name, helper);
				Handlebars.registerHelper(name, helper);
				logger.info(`Helper "${name}" registered successfully`);
			} catch (err: any) {
				logger.error(`Failed to add helper "${name}": ${err.message}`);
				throw err;
			}
		},

		/**
		 * Returns a specific helper by name.
		 *
		 * @param {string} name - The name of the helper to retrieve
		 * @returns {HelperDelegate} The helper function
		 * @throws {GenobiError} If the helper is not found
		 */
		getHelper: (name: string): HelperDelegate => {
			const helper = store.state().helpers.get(name);
			if (!helper) {
				throw new GenobiError("HELPER_NOT_FOUND", `Helper "${name}" not found in loaded configuration.`);
			}
			return helper;
		},

		/**
		 * Returns all registered Handlebars helpers.
		 *
		 * @returns {Record<string, HelperDelegate>} An object containing all registered helpers, keyed by name
		 */
		getHelpers: (): Record<string, HelperDelegate> => Object.fromEntries(store.state().helpers),

		/**
		 * Adds a custom Handlebars template partial.
		 *
		 * @param {string} name - The name of the partial
		 * @param {Template | TemplateDelegate} templateStr - The partial template string or template function
		 * @throws {ValidationError} If validation fails
		 */
		addPartial: (name: string, templateStr: Template | TemplateDelegate) => {
			try {
				// Validate the partial
				validation.validatePartial(name, templateStr);

				// Check if partial with this name already exists
				if (store.state().partials.has(name)) {
					logger.warn(`Partial "${name}" already exists and will be overwritten`);
				}

				// Store the partial
				store.setPartial(name, templateStr);
				logger.info(`Partial "${name}" registered successfully`);
			} catch (err: any) {
				logger.error(`Failed to add partial "${name}": ${err.message}`);
				throw err;
			}
		},

		/**
		 * Adds a custom Handlebars template partial from a file.
		 *
		 * @param {string} name - The name of the partial
		 * @param {string} partialFilePath - The path to the partial template file, relative to the config file
		 * @returns {Promise<void>}
		 * @throws {ValidationError} If validation fails
		 * @throws {ReadError} If reading the file fails
		 */
		addPartialFromFile: async (name: string, partialFilePath: string): Promise<void> => {
			try {
				// Validate the inputs
				validation.validatePartialFilePath(name, partialFilePath);

				// Check if partial with this name already exists
				if (store.state().partials.has(name)) {
					logger.warn(`Partial "${name}" already exists and will be overwritten`);
				}

				// Read the file content
				const resolvedPath = path.resolve(store.state().configPath, partialFilePath);
				logger.info(`Reading partial from file: ${resolvedPath}`);
				const fileResult = await fileSys.readFromFile(resolvedPath);

				// Store the partial
				store.setPartial(name, fileResult);
				logger.info(`Partial "${name}" loaded from file successfully`);
			} catch (err: any) {
				logger.error(`Failed to add partial "${name}" from file: ${err.message}`);
				throw err;
			}
		},

		/**
		 * Returns a specific template partial by name.
		 *
		 * @param {string} name - The name of the partial to retrieve
		 * @returns {Template | TemplateDelegate} The partial template
		 * @throws {GenobiError} If the partial is not found
		 */
		getPartial: (name: string): Template | TemplateDelegate => {
			const partial = store.state().partials.get(name);
			if (!partial) {
				throw new GenobiError("PARTIAL_NOT_FOUND", `Template partial "${name}" not found in loaded configuration.`);
			}
			return partial;
		},

		/**
		 * Returns all registered template partials.
		 *
		 * @returns {Record<string, Template | TemplateDelegate>} An object containing all registered partials, keyed by name
		 */
		getPartials: (): Record<string, Template | TemplateDelegate> => Object.fromEntries(store.state().partials),
	};
}

/**
 * The singleton Genobi configuration API.
 * This is exposed to user configuration files to define generators, helpers, and options.
 */
const configAPI = {
	/**
	 * Returns the Genobi configuration API.
	 *
	 * @returns {ConfigAPI} The configuration API object
	 */
	get: configApi,
};
export { configAPI };
