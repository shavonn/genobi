import type { HelperDelegate } from "handlebars";
import type { GeneratorConfig } from "./generator";

export interface ConfigAPI {
	setConfigPath(path: string): void;
	getConfigPath(): string;
	getDestinationBasePath(): string;
	setSelectionPrompt(prompt: string): void;
	getSelectionPrompt(): string;
	addGenerator(id: string, generator: GeneratorConfig): void;
	getGenerator(generatorId: string): GeneratorConfig | undefined;
	getGenerators(): Record<string, GeneratorConfig>;
	addHelper(name: string, helper: HelperDelegate): void;
	getHelper(name: string): HelperDelegate;
	getHelpers(): Record<string, HelperDelegate>;
}
