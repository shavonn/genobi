import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
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
	partials: ConfiguredPartials;
}

export type ConfiguredGenerators = Map<string, GeneratorConfig>;
export type ConfiguredHelpers = Map<string, HelperDelegate>;
export type ConfiguredPartials = Map<string, Template | TemplateDelegate>;

export interface SelectChoice {
	name: string;
	value: string;
}
