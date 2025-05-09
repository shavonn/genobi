import path from "node:path";
import type { HelperDelegate, Template, TemplateDelegate } from "handlebars";
import type {
	ConfigStoreState,
	ConfiguredGenerators,
	ConfiguredHelpers,
	ConfiguredPartials,
	SelectChoice,
} from "./types/config-store";
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
	#partials: ConfiguredPartials = new Map<string, Template>();

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

	setHelper: (name: string, helper: HelperDelegate) => void = (name, helper) => {
		this.#helpers.set(name, helper);
	};

	setPartial: (name: string, templateStr: Template | TemplateDelegate) => void = (name, templateStr) => {
		this.#partials.set(name, templateStr);
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
			partials: this.#partials,
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
		this.#partials = new Map<string, Template | TemplateDelegate>();
	};
}

const store = new ConfigStore();
export { store };
