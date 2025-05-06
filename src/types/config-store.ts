import type { HelperDelegate } from "handlebars";
import type { GeneratorConfig } from "./generator";

export interface ConfigStoreState {
	logDebug: boolean;
	logVerbose: boolean;
	configFilePath: string;
	destinationBasePath: string;
	selectionPrompt: string;
	selectedGenerator: string;
	generators: ConfiguredGenerators;
	helpers: ConfiguredHelpers;
}

export type ConfiguredGenerators = Map<string, GeneratorConfig>;
export type ConfiguredHelpers = Map<string, HelperDelegate>;
