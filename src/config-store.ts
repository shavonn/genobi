import path from "node:path";
import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type {
	ConfigStoreState,
	ConfiguredGenerators,
	ConfiguredHelpers,
	ConfiguredOperations,
	ConfiguredPartials,
} from "./types/config-store";
import type { SelectChoice } from "./types/general";
import type { GeneratorConfig } from "./types/generator";
import type { CustomOperationHandler } from "./types/operation";

/** Default prompt message for generator selection */
const DEFAULT_SELECTION_PROMPT = "Select from available generators:";

/**
 * Store for managing Genobi's configuration state.
 * This class maintains all configuration settings and provides methods to access and modify them.
 *
 * For CLI usage, use the default `store` singleton export.
 * For library usage or testing with isolation, use `createConfigStore()` to create independent instances.
 *
 * @example
 * // CLI usage (singleton)
 * import { store } from './config-store';
 * store.setConfigFilePath('/path/to/config.js');
 *
 * @example
 * // Library usage (isolated instance)
 * import { createConfigStore } from './config-store';
 * const myStore = createConfigStore();
 * myStore.setConfigFilePath('/path/to/config.js');
 */
class ConfigStore {
	/** Flag to enable debug logging */
	#logDebug: boolean;
	/** Flag to enable verbose logging */
	#logVerbose: boolean;
	/** Path to the config file */
	#configFilePath: string;
	/** Directory containing the config file */
	#configPath: string;
	/** Base directory for resolving relative paths in operations */
	#destinationBasePath: string;
	/** Prompt message for generator selection */
	#selectionPrompt: string;
	/** ID of the currently selected generator */
	#selectedGenerator: string;
	/** Map of all registered generators */
	#generators: ConfiguredGenerators;
	/** Map of all registered Handlebars helpers */
	#helpers: ConfiguredHelpers;
	/** Map of all registered Handlebars partials */
	#partials: ConfiguredPartials;
	/** Map of all registered custom operations */
	#operations: ConfiguredOperations;

	/**
	 * Creates a new ConfigStore instance with default values.
	 * For most use cases, prefer using the `store` singleton or `createConfigStore()`.
	 */
	constructor() {
		this.#logDebug = false;
		this.#logVerbose = false;
		this.#configFilePath = "";
		this.#configPath = "";
		this.#destinationBasePath = "";
		this.#selectionPrompt = DEFAULT_SELECTION_PROMPT;
		this.#selectedGenerator = "";
		this.#generators = new Map<string, GeneratorConfig>();
		this.#helpers = new Map<string, HelperDelegate>();
		this.#partials = new Map<string, Template | TemplateDelegate>();
		this.#operations = new Map<string, CustomOperationHandler>();
	}

	/**
	 * Enables debug logging.
	 * When enabled, debug information will be printed to the console.
	 */
	enableDebugLogging(): void {
		this.#logDebug = true;
	}

	/**
	 * Enables verbose logging.
	 * When enabled, additional information about operations will be printed to the console.
	 */
	enableVerboseLogging(): void {
		this.#logVerbose = true;
	}

	/**
	 * Sets the path to the configuration file.
	 * Also sets the config path to the directory containing the file.
	 *
	 * @param {string} configFilePath - Absolute path to the config file
	 */
	setConfigFilePath(configFilePath: string): void {
		this.#configFilePath = configFilePath;
		this.#configPath = path.dirname(configFilePath);
	}

	/**
	 * Sets the base directory for resolving relative paths in operations.
	 *
	 * @param {string} destinationDirPath - Absolute path to the base directory
	 */
	setDestinationBasePath(destinationDirPath: string): void {
		this.#destinationBasePath = destinationDirPath;
	}

	/**
	 * Sets the prompt message displayed when selecting a generator.
	 *
	 * @param {string} prompt - The prompt message to display
	 */
	setSelectionPrompt(prompt: string): void {
		this.#selectionPrompt = prompt;
	}

	/**
	 * Sets the ID of the currently selected generator.
	 *
	 * @param {string} generatorId - ID of the generator to select
	 */
	setSelectedGenerator(generatorId: string): void {
		this.#selectedGenerator = generatorId;
	}

	/**
	 * Adds or updates a generator in the store.
	 *
	 * @param {string} id - The ID of the generator
	 * @param {GeneratorConfig} generator - The generator configuration
	 */
	setGenerator(id: string, generator: GeneratorConfig): void {
		this.#generators.set(id, generator);
	}

	/**
	 * Gets a list of all registered generators as choices for selection.
	 *
	 * @returns {SelectChoice[]} Array of generator choices with ID and description
	 */
	getGeneratorsList(): SelectChoice[] {
		const list: SelectChoice[] = [];
		this.#generators.forEach((generator: GeneratorConfig, id: string) => {
			list.push({ value: id, name: generator.description });
		});
		return list;
	}

	/**
	 * Adds or updates a Handlebars helper in the store.
	 *
	 * @param {string} name - The name of the helper
	 * @param {HelperDelegate} helper - The helper function
	 */
	setHelper(name: string, helper: HelperDelegate): void {
		this.#helpers.set(name, helper);
	}

	/**
	 * Adds or updates a Handlebars partial in the store.
	 *
	 * @param {string} name - The name of the partial
	 * @param {Template | TemplateDelegate} templateStr - The partial template string or function
	 */
	setPartial(name: string, templateStr: Template | TemplateDelegate): void {
		this.#partials.set(name, templateStr);
	}

	/**
	 * Adds or updates a custom operation in the store.
	 *
	 * @param {string} name - The name of the operation
	 * @param {CustomOperationHandler} handler - The operation handler function
	 */
	setOperation(name: string, handler: CustomOperationHandler): void {
		this.#operations.set(name, handler);
	}

	/**
	 * Returns a snapshot of the current store state.
	 *
	 * @returns {ConfigStoreState} The current state of the configuration store
	 */
	state(): ConfigStoreState {
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
			operations: this.#operations,
		};
	}

	/**
	 * Resets the store to its default state.
	 * Clears all generators, helpers, partials, operations, and other settings.
	 */
	resetDefault(): void {
		this.#logDebug = false;
		this.#logVerbose = false;
		this.#configPath = "";
		this.#configFilePath = "";
		this.#destinationBasePath = "";
		this.#selectedGenerator = "";
		this.#selectionPrompt = DEFAULT_SELECTION_PROMPT;
		this.#generators = new Map<string, GeneratorConfig>();
		this.#helpers = new Map<string, HelperDelegate>();
		this.#partials = new Map<string, Template | TemplateDelegate>();
		this.#operations = new Map<string, CustomOperationHandler>();
	}
}

/**
 * Creates a new isolated ConfigStore instance.
 * Use this when you need an independent configuration context,
 * such as for library usage, testing, or running multiple configurations concurrently.
 *
 * @returns {ConfigStore} A new ConfigStore instance
 *
 * @example
 * const isolatedStore = createConfigStore();
 * isolatedStore.setConfigFilePath('/path/to/config.js');
 * // This store is completely independent from the default singleton
 */
function createConfigStore(): ConfigStore {
	return new ConfigStore();
}

/**
 * Default singleton instance of the configuration store.
 * This is used throughout the CLI application to access and modify configuration state.
 *
 * For isolated instances (library usage, testing), use `createConfigStore()` instead.
 */
const store = new ConfigStore();

export { ConfigStore, createConfigStore, store };
