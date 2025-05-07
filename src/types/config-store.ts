import type { HelperDelegate } from "handlebars";
import type { GeneratorConfig } from "./generator";

export interface ConfigStoreState {
	logDebug: boolean;
	logVerbose: boolean;
	configPath: string;
	configFilePath: string;
	destinationBasePath: string;
	selectionPrompt: string;
	selectedGenerator: string;
	generators: ConfiguredGenerators;
	helpers: ConfiguredHelpers;
}

export type ConfiguredGenerators = Map<string, GeneratorConfig>;
export type ConfiguredHelpers = Map<string, HelperDelegate>;

export interface SelectChoice {
	name: string;
	value: string;
}
