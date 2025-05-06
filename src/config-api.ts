import { store } from "./config-store";
import type { GenobiConfigAPI } from "./types/config-api";
import type { GeneratorConfig } from "./types/generator";

function configApi(): GenobiConfigAPI {
	return {
		setConfigPath: store.setConfigFilePath,
		getConfigPath: () => store.state().configFilePath,
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
				throw new Error(`Generator ${generatorId} not found in loaded configuration.`);
			}
			return generator;
		},
		getGenerators: (): Record<string, GeneratorConfig> => Object.fromEntries(store.state().generators),
	};
}

const configAPI = {
	get: configApi,
};
export { configAPI };
