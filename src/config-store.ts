import path from "node:path";
import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type {
	ConfigStoreState,
	ConfiguredGenerators,
	ConfiguredHelpers,
	ConfiguredPartials,
} from "./types/config-store";
import type { SelectChoice } from "./types/general";
import type { GeneratorConfig } from "./types/generator";

/**
 * Store for managing Genobi's configuration state.
 * This class maintains all configuration settings and provides methods to access and modify them.
 */
class ConfigStore {
	/** Flag to enable debug logging */
	#logDebug = false;
	/** Flag to enable verbose logging */
	#logVerbose = false;
	/** Path to the config file */
	#configFilePath = "";
	/** Directory containing the config file */
	#configPath = "";
	/** Base directory for resolving relative paths in operations */
	#destinationBasePath = "";
	/** Prompt message for generator selection */
	#selectionPrompt = "";
	/** ID of the currently selected generator */
	#selectedGenerator = "";
	/** Map of all registered generators */
	#generators: ConfiguredGenerators = new Map<string, GeneratorConfig>();
	/** Map of all registered Handlebars helpers */
	#helpers: ConfiguredHelpers = new Map<string, HelperDelegate>();
	/** Map of all registered Handlebars partials */
	#partials: ConfiguredPartials = new Map<string, Template>();

	/**
	 * Enables debug logging.
	 * When enabled, debug information will be printed to the console.
	 */
	enableDebugLogging: () => void = () => {
		this.#logDebug = true;
	};

	/**
	 * Enables verbose logging.
	 * When enabled, additional information about operations will be printed to the console.
	 */
	enableVerboseLogging: () => void = () => {
		this.#logVerbose = true;
	};

	/**
	 * Sets the path to the configuration file.
	 * Also sets the config path to the directory containing the file.
	 *
	 * @param {string} configFilePath - Absolute path to the config file
	 */
	setConfigFilePath: (configFilePath: string) => void = (configFilePath) => {
		this.#configFilePath = configFilePath;
		this.#configPath = path.dirname(configFilePath);
	};

	/**
	 * Sets the base directory for resolving relative paths in operations.
	 *
	 * @param {string} destPath - Absolute path to the base directory
	 */
	setDestinationBasePath: (destPath: string) => void = (destPath) => {
		this.#destinationBasePath = destPath;
	};

	/**
	 * Sets the prompt message displayed when selecting a generator.
	 *
	 * @param {string} prompt - The prompt message to display
	 */
	setSelectionPrompt: (prompt: string) => void = (prompt) => {
		this.#selectionPrompt = prompt;
	};

	/**
	 * Sets the ID of the currently selected generator.
	 *
	 * @param {string} generatorId - ID of the generator to select
	 */
	setSelectedGenerator: (generatorId: string) => void = (generatorId) => {
		this.#selectedGenerator = generatorId;
	};

	/**
	 * Adds or updates a generator in the store.
	 *
	 * @param {string} id - The ID of the generator
	 * @param {GeneratorConfig} generator - The generator configuration
	 */
	setGenerator: (id: string, generator: GeneratorConfig) => void = (id, generator) => {
		this.#generators.set(id, generator);
	};

	/**
	 * Gets a list of all registered generators as choices for selection.
	 *
	 * @returns {SelectChoice[]} Array of generator choices with ID and description
	 */
	getGeneratorsList: () => SelectChoice[] = () => {
		const list: SelectChoice[] = [];
		this.#generators.forEach((generator: GeneratorConfig, id: string) => {
			list.push({ value: id, name: generator.description });
		});
		return list;
	};

	/**
	 * Adds or updates a Handlebars helper in the store.
	 *
	 * @param {string} name - The name of the helper
	 * @param {HelperDelegate} helper - The helper function
	 */
	setHelper: (name: string, helper: HelperDelegate) => void = (name, helper) => {
		this.#helpers.set(name, helper);
	};

	/**
	 * Adds or updates a Handlebars partial in the store.
	 *
	 * @param {string} name - The name of the partial
	 * @param {Template | TemplateDelegate} templateStr - The partial template string or function
	 */
	setPartial: (name: string, templateStr: Template | TemplateDelegate) => void = (name, templateStr) => {
		this.#partials.set(name, templateStr);
	};

	/**
	 * Returns a snapshot of the current store state.
	 *
	 * @returns {ConfigStoreState} The current state of the configuration store
	 */
	state: () => ConfigStoreState = () => {
		return {
			logDebug: this.#logDebug,
			logVerbose: this.#logVerbose,
			configPath: this.#configPath,
			configFilePath: this.#configFilePath,
			destinationBasePath: this.#destinationBasePath,
			selectedGenerator: this.#selectedGenerator,
			selectionPrompt: this.#selectionPrompt,
			generators: this.#generators,
			helpers: this.#helpers,
			partials: this.#partials,
		};
	};

	/**
	 * Resets the store to its default state.
	 * Clears all generators, helpers, partials, and other settings.
	 */
	resetDefault: () => void = () => {
		this.#logDebug = false;
		this.#logVerbose = false;
		this.#configPath = "";
		this.#configFilePath = "";
		this.#destinationBasePath = "";
		this.#selectedGenerator = "";
		this.#selectionPrompt = "Select from available generators:";
		this.#generators = new Map<string, GeneratorConfig>();
		this.#helpers = new Map<string, HelperDelegate>();
		this.#partials = new Map<string, Template | TemplateDelegate>();
	};
}

/**
 * Singleton instance of the configuration store.
 * This is used throughout the application to access and modify configuration state.
 */
const store = new ConfigStore();
export { store };
