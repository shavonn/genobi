import path from "node:path";
import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import Handlebars from "handlebars";
import { store } from "./config-store";
import { GenobiError } from "./errors";
import type { ConfigAPI } from "./types/config-api";
import type { GeneratorConfig } from "./types/generator";
import { fileSys } from "./utils/file-sys";

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
		getConfigFilePath: () => store.state().configFilePath,

		/**
		 * Returns the base directory path used for generating files.
		 * All relative paths in operations will be resolved from this path.
		 *
		 * @returns {string} The base directory path for file operations
		 */
		getDestinationBasePath: () => store.state().destinationBasePath,

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
		getSelectionPrompt: () => store.state().selectionPrompt,

		/**
		 * Adds a new generator to the configuration.
		 *
		 * @param {string} id - Unique identifier for the generator
		 * @param {GeneratorConfig} generator - The generator configuration
		 * @throws {GenobiError} If validation fails (currently not implemented)
		 *
		 * @example
		 * ```
		 * genobi.addGenerator("react-component", {
		 *   description: "React component",
		 *   prompts: [
		 *     {
		 *       type: "input",
		 *       name: "name",
		 *       message: "What is the name of this component?"
		 *     }
		 *   ],
		 *   operations: [
		 *     {
		 *       type: "create",
		 *       filePath: "src/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
		 *       templateStr: `export function {{pascalCase name}}() {
		 *         return (
		 *           <div className="{{kebabCase name}}" />
		 *         );
		 *       }`
		 *     }
		 *   ]
		 * });
		 * ```
		 */
		addGenerator: (id: string, generator: GeneratorConfig): void => {
			// TODO: validate generator
			store.setGenerator(id, generator);
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
		 *
		 * @example
		 * ```
		 * genobi.addHelper("uppercase", (str) => {
		 *   return String(str).toUpperCase();
		 * });
		 * ```
		 */
		addHelper: (name, helper: HelperDelegate): void => {
			store.setHelper(name, helper);
			Handlebars.registerHelper(name, helper);
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
		 *
		 * @example
		 * ```
		 * genobi.addPartial("header", "<header>{{title}}</header>");
		 * ```
		 */
		addPartial: (name: string, templateStr: Template | TemplateDelegate) => {
			store.setPartial(name, templateStr);
		},

		/**
		 * Adds a custom Handlebars template partial from a file.
		 *
		 * @param {string} name - The name of the partial
		 * @param {string} partialFilePath - The path to the partial template file, relative to the config file
		 * @returns {Promise<void>}
		 *
		 * @example
		 * ```
		 * await genobi.addPartialFromFile("componentProps", "templates/partials/component-props.hbs");
		 * ```
		 */
		addPartialFromFile: async (name: string, partialFilePath: string) => {
			const fileResult = await fileSys.readFromFile(path.resolve(store.state().configPath, partialFilePath));
			store.setPartial(name, fileResult);
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
