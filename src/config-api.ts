import type { HelperDelegate } from "handlebars";
import Handlebars from "handlebars";
import { store } from "./config-store";
import { GenobiError } from "./errors";
import type { ConfigAPI } from "./types/config-api";
import type { GeneratorConfig } from "./types/generator";

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
				throw new GenobiError("GENERATOR_NOT_FOUND", `Generator ${generatorId} not found in loaded configuration.`);
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
				throw new GenobiError("HELPER_NOT_FOUND", `Helper ${name} not found in loaded configuration.`);
			}
			return helper;
		},
		getHelpers: (): Record<string, HelperDelegate> => Object.fromEntries(store.state().helpers),
	};
}

const configAPI = {
	get: configApi,
};
export { configAPI };
