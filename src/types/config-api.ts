import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type { GeneratorConfig } from "./generator";
import type { CustomOperationHandler } from "./operation";

/**
 * Configuration API Interface for Genobi.
 * This interface defines the methods available in the configuration file to set up generators,
 * helpers, partials, and other options.
 */
export interface ConfigAPI {
	/**
	 * Sets the path to the configuration file.
	 *
	 * @param {string} path - The absolute path to the config file
	 */
	setConfigFilePath(path: string): void;

	/**
	 * Returns the current configuration file path.
	 *
	 * @returns {string} The absolute path to the config file
	 */
	getConfigFilePath(): string;

	/**
	 * Sets the base directory path used for generating files.
	 *
	 * @param {string} path - The base directory path for file operations
	 */
	setDestinationBasePath(path: string): void;

	/**
	 * Returns the base directory path used for generating files.
	 * All relative paths in operations will be resolved from this path.
	 *
	 * @returns {string} The base directory path for file operations
	 */
	getDestinationBasePath(): string;

	/**
	 * Sets the prompt message displayed during generator selection.
	 *
	 * @param {string} prompt - The prompt message to display
	 */
	setSelectionPrompt(prompt: string): void;

	/**
	 * Returns the current generator selection prompt message.
	 *
	 * @returns {string} The prompt message
	 */
	getSelectionPrompt(): string;

	/**
	 * Adds a new generator to the configuration.
	 *
	 * @param {string} id - Unique identifier for the generator
	 * @param {GeneratorConfig} generator - The generator configuration
	 */
	addGenerator(id: string, generator: GeneratorConfig): void;

	/**
	 * Returns a specific generator by ID.
	 *
	 * @param {string} generatorId - The ID of the generator to retrieve
	 * @returns {GeneratorConfig | undefined} The generator configuration or undefined if not found
	 */
	getGenerator(generatorId: string): GeneratorConfig | undefined;

	/**
	 * Returns all registered generators.
	 *
	 * @returns {Record<string, GeneratorConfig>} An object containing all registered generators, keyed by ID
	 */
	getGenerators(): Record<string, GeneratorConfig>;

	/**
	 * Adds a custom Handlebars helper function.
	 *
	 * @param {string} name - The name of the helper
	 * @param {HelperDelegate} helper - The helper function implementation
	 */
	addHelper(name: string, helper: HelperDelegate): void;

	/**
	 * Returns a specific helper by name.
	 *
	 * @param {string} name - The name of the helper to retrieve
	 * @returns {HelperDelegate} The helper function
	 */
	getHelper(name: string): HelperDelegate;

	/**
	 * Returns all registered Handlebars helpers.
	 *
	 * @returns {Record<string, HelperDelegate>} An object containing all registered helpers, keyed by name
	 */
	getHelpers(): Record<string, HelperDelegate>;

	/**
	 * Adds a custom Handlebars template partial.
	 *
	 * @param {string} name - The name of the partial
	 * @param {Template | TemplateDelegate} partial - The partial template string or template function
	 */
	addPartial(name: string, partial: Template | TemplateDelegate): void;

	/**
	 * Adds a custom Handlebars template partial from a file.
	 *
	 * @param {string} name - The name of the partial
	 * @param {string} filePath - The path to the partial template file, relative to the config file
	 * @returns {Promise<void>}
	 */
	addPartialFromFile(name: string, filePath: string): Promise<void>;

	/**
	 * Returns a specific template partial by name.
	 *
	 * @param {string} name - The name of the partial to retrieve
	 * @returns {Template | TemplateDelegate} The partial template
	 */
	getPartial(name: string): Template | TemplateDelegate;

	/**
	 * Returns all registered template partials.
	 *
	 * @returns {Record<string, Template | TemplateDelegate>} An object containing all registered partials, keyed by name
	 */
	getPartials(): Record<string, Template | TemplateDelegate>;

	/**
	 * Adds a custom operation handler.
	 * Custom operations can be used with `type: "operationName"` in generator configurations.
	 *
	 * @param {string} name - The name of the operation (used as the `type` in operations)
	 * @param {CustomOperationHandler} handler - The operation handler function
	 */
	addOperation(name: string, handler: CustomOperationHandler): void;

	/**
	 * Returns a specific custom operation handler by name.
	 *
	 * @param {string} name - The name of the operation to retrieve
	 * @returns {CustomOperationHandler | undefined} The operation handler or undefined if not found
	 */
	getOperation(name: string): CustomOperationHandler | undefined;

	/**
	 * Returns all registered custom operations.
	 *
	 * @returns {Record<string, CustomOperationHandler>} An object containing all registered operations, keyed by name
	 */
	getOperations(): Record<string, CustomOperationHandler>;
}
