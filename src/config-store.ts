import path from "node:path";
import type { HelperDelegate } from "handlebars";
import type { ConfigStoreState, ConfiguredGenerators, ConfiguredHelpers, SelectChoice } from "./types/config-store";
import type { GeneratorConfig } from "./types/generator";

class ConfigStore {
	#logDebug = false;
	#logVerbose = false;
	#configFilePath = "";
	#configPath = "";
	#destinationBasePath = "";
	#selectionPrompt = "";
	#selectedGenerator = "";
	#generators: ConfiguredGenerators = new Map<string, GeneratorConfig>();
	#helpers: ConfiguredHelpers = new Map<string, HelperDelegate>();

	enableDebugLogging: () => void = () => {
		this.#logDebug = true;
	};

	enableVerboseLogging: () => void = () => {
		this.#logVerbose = true;
	};

	setConfigFilePath: (configFilePath: string) => void = (configFilePath) => {
		this.#configFilePath = configFilePath;
		this.#configPath = path.dirname(configFilePath);
	};

	setDestinationBasePath: (destPath: string) => void = (destPath) => {
		this.#destinationBasePath = destPath;
	};

	setSelectionPrompt: (prompt: string) => void = (prompt) => {
		this.#selectionPrompt = prompt;
	};

	setSelectedGenerator: (generatorId: string) => void = (generatorId) => {
		this.#selectedGenerator = generatorId;
	};

	setGenerator: (id: string, generator: GeneratorConfig) => void = (id, generator) => {
		this.#generators.set(id, generator);
	};

	getGeneratorsList: () => SelectChoice[] = () => {
		const list: SelectChoice[] = [];
		this.#generators.forEach((generator: GeneratorConfig, id: string) => {
			list.push({ value: id, name: generator.description });
		});
		return list;
	};

	setHelper: (id: string, helper: HelperDelegate) => void = (id, helper) => {
		this.#helpers.set(id, helper);
	};

	state: () => ConfigStoreState = () => {
		return {
			logDebug: this.#logDebug,
			logVerbose: this.#logVerbose,
			configPath: this.#configPath,
			configFilePath: this.#configFilePath,
			destinationBasePath: this.#destinationBasePath,
			selectedGenerator: this.#selectedGenerator,
			selectionPrompt: this.#selectionPrompt,
			generators: this.#generators,
			helpers: this.#helpers,
		};
	};

	resetDefault: () => void = () => {
		this.#logDebug = false;
		this.#logVerbose = false;
		this.#configPath = "";
		this.#configFilePath = "";
		this.#destinationBasePath = "";
		this.#selectedGenerator = "";
		this.#selectionPrompt = "Select from available generators:";
		this.#generators = new Map<string, GeneratorConfig>();
		this.#helpers = new Map<string, HelperDelegate>();
	};
}

const store = new ConfigStore();
export { store };
