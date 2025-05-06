import type { GeneratorConfig } from "./generator";

export interface GenobiConfigAPI {
	setConfigPath(path: string): void;
	getConfigPath(): string;
	getDestinationBasePath(): string;
	setSelectionPrompt(prompt: string): void;
	getSelectionPrompt(): string;
	addGenerator(id: string, generator: GeneratorConfig): void;
	getGenerator(generatorId: string): GeneratorConfig | undefined;
	getGenerators(): Record<string, GeneratorConfig>;
}
