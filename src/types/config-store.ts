import type { GeneratorConfig } from "./generator";

export interface ConfigStoreState {
	logDebug: boolean;
	logVerbose: boolean;
	configFilePath: string;
	destinationBasePath: string;
	selectionPrompt: string;
	generators: ConfiguredGenerators;
}

export type ConfiguredGenerators = Map<string, GeneratorConfig>;
