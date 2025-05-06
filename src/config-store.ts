import type { ConfigStoreState } from "./types/config-store";

class ConfigStore {
	#logDebug = false;
	#logVerbose = false;
	#configFilePath = "";
	#destinationBasePath = "";
	#selectionPrompt = "Select from available generators:";

	enableDebugLogging: () => void = () => {
		this.#logDebug = true;
	};

	enableVerboseLogging: () => void = () => {
		this.#logVerbose = true;
	};

	setConfigFilePath: (path: string) => void = (path) => {
		this.#configFilePath = path;
	};

	setDestinationBasePath: (path: string) => void = (path) => {
		this.#destinationBasePath = path;
	};

	setSelectionPrompt: (prompt: string) => void = (prompt) => {
		this.#selectionPrompt = prompt;
	};

	state: () => ConfigStoreState = () => {
		return {
			logDebug: this.#logDebug,
			logVerbose: this.#logVerbose,
			configFilePath: this.#configFilePath,
			destinationBasePath: this.#destinationBasePath,
			selectionPrompt: this.#selectionPrompt,
		};
	};

	reset: () => void = () => {
		this.#logDebug = false;
		this.#logVerbose = false;
		this.#configFilePath = "";
		this.#destinationBasePath = "";
		this.#selectionPrompt = "Select from available generators:";
	};
}

const store = new ConfigStore();
export { store };
