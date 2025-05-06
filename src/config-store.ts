import type { StoreState } from "./types/store";

class ConfigStore {
	#logDebug = false;
	#logVerbose = false;

	enableDebugLogging: () => void = () => {
		this.#logDebug = true;
	};

	enableVerboseLogging: () => void = () => {
		this.#logVerbose = true;
	};

	state: () => StoreState = () => {
		return {
			logDebug: this.#logDebug,
			logVerbose: this.#logVerbose,
		};
	};

	reset: () => void = () => {
		this.#logDebug = false;
		this.#logVerbose = false;
	};
}

const store = new ConfigStore();
export { store };
