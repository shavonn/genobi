import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type { GeneratorConfig } from "./generator";

/**
 * Represents the complete state of the configuration store.
 * This includes all settings, generators, helpers, and partials.
 */
export interface ConfigStoreState {
	/**
	 * Whether debug logging is enabled.
	 */
	logDebug: boolean;

	/**
	 * Whether verbose logging is enabled.
	 */
	logVerbose: boolean;

	/**
	 * The directory containing the config file.
	 */
	configPath: string;

	/**
	 * The full path to the config file.
	 */
	configFilePath: string;

	/**
	 * The base directory for resolving relative paths in operations.
	 */
	destinationBasePath: string;

	/**
	 * The prompt message displayed when selecting a generator.
	 */
	selectionPrompt: string;

	/**
	 * The ID of the currently selected generator.
	 */
	selectedGenerator: string;

	/**
	 * Map of all registered generators, keyed by ID.
	 */
	generators: ConfiguredGenerators;

	/**
	 * Map of all registered Handlebars helpers, keyed by name.
	 */
	helpers: ConfiguredHelpers;

	/**
	 * Map of all registered Handlebars partials, keyed by name.
	 */
	partials: ConfiguredPartials;
}

/**
 * Map of generator IDs to their configurations.
 */
export type ConfiguredGenerators = Map<string, GeneratorConfig>;

/**
 * Map of helper names to their implementations.
 */
export type ConfiguredHelpers = Map<string, HelperDelegate>;

/**
 * Map of partial names to their templates.
 */
export type ConfiguredPartials = Map<string, Template | TemplateDelegate>;
