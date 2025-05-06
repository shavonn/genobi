import { store } from "./config-store";
import type { GenobiConfigAPI } from "./types/config-api";

function configApi(): GenobiConfigAPI {
	return {
		setConfigPath: store.setConfigFilePath,
		getConfigPath: () => store.state().configFilePath,
		getDestinationBasePath: () => store.state().destinationBasePath,
		setSelectionPrompt: store.setSelectionPrompt,
		getSelectionPrompt: () => store.state().selectionPrompt,
	};
}

const configAPI = {
	get: configApi,
};
export { configAPI };
