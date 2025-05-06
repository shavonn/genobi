import type { StoreState } from "./types/store";

class ConfigStore {
	#logDebug = false;
	#logVerbose = false;
	#configFilePath = "";
	#destinationBasePath = "";

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

	state: () => StoreState = () => {
		return {
			logDebug: this.#logDebug,
			logVerbose: this.#logVerbose,
			configFilePath: this.#configFilePath,
			destinationBasePath: this.#destinationBasePath,
		};
	};

	reset: () => void = () => {
		this.#logDebug = false;
		this.#logVerbose = false;
		this.#configFilePath = "";
		this.#destinationBasePath = "";
	};
}

const store = new ConfigStore();
export { store };
