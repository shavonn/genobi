import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type { GeneratorConfig } from "./generator";

export interface ConfigAPI {
	setConfigFilePath(path: string): void;
	getConfigFilePath(): string;
	getDestinationBasePath(): string;
	setSelectionPrompt(prompt: string): void;
	getSelectionPrompt(): string;
	addGenerator(id: string, generator: GeneratorConfig): void;
	getGenerator(generatorId: string): GeneratorConfig | undefined;
	getGenerators(): Record<string, GeneratorConfig>;
	addHelper(name: string, helper: HelperDelegate): void;
	getHelper(name: string): HelperDelegate;
	getHelpers(): Record<string, HelperDelegate>;
	addPartial(name: string, partial: Template | TemplateDelegate): void;
	addPartialFromFile(name: string, filePath: string): Promise<void>;
	getPartial(name: string): Template | TemplateDelegate;
	getPartials(): Record<string, Template | TemplateDelegate>;
}
