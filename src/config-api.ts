import path from "node:path";
import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import Handlebars from "handlebars";
import { store } from "./config-store";
import { GenobiError } from "./errors";
import type { ConfigAPI } from "./types/config-api";
import type { GeneratorConfig } from "./types/generator";
import { fileSys } from "./utils/file-sys";

function configApi(): ConfigAPI {
	return {
		setConfigFilePath: store.setConfigFilePath,
		getConfigFilePath: () => store.state().configFilePath,
		getDestinationBasePath: () => store.state().destinationBasePath,
		setSelectionPrompt: store.setSelectionPrompt,
		getSelectionPrompt: () => store.state().selectionPrompt,
		addGenerator: (id: string, generator: GeneratorConfig): void => {
			// TODO: validate generator
			store.setGenerator(id, generator);
		},
		getGenerator: (generatorId: string): GeneratorConfig => {
			const generator = store.state().generators.get(generatorId);
			if (!generator) {
				throw new GenobiError("GENERATOR_NOT_FOUND", `Generator "${generatorId}" not found in loaded configuration.`);
			}
			return generator;
		},
		getGenerators: (): Record<string, GeneratorConfig> => Object.fromEntries(store.state().generators),
		addHelper: (name, helper: HelperDelegate): void => {
			store.setHelper(name, helper);
			Handlebars.registerHelper(name, helper);
		},
		getHelper: (name: string): HelperDelegate => {
			const helper = store.state().helpers.get(name);
			if (!helper) {
				throw new GenobiError("HELPER_NOT_FOUND", `Helper "${name}" not found in loaded configuration.`);
			}
			return helper;
		},
		getHelpers: (): Record<string, HelperDelegate> => Object.fromEntries(store.state().helpers),
		addPartial: (name: string, templateStr: Template | TemplateDelegate) => {
			store.setPartial(name, templateStr);
		},
		addPartialFromFile: async (name: string, partialFilePath: string) => {
			const fileResult = await fileSys.readFromFile(path.resolve(store.state().configPath, partialFilePath));
			store.setPartial(name, fileResult);
		},
		getPartial: (name: string): Template | TemplateDelegate => {
			const partial = store.state().partials.get(name);
			if (!partial) {
				throw new GenobiError("PARTIAL_NOT_FOUND", `Template partial "${name}" not found in loaded configuration.`);
			}
			return partial;
		},
		getPartials: (): Record<string, Template | TemplateDelegate> => Object.fromEntries(store.state().partials),
	};
}

const configAPI = {
	get: configApi,
};
export { configAPI };
