import { store } from "./config-store";
import type { GenobiConfigAPI } from "./types/config-api";

function configApi(): GenobiConfigAPI {
	return {
		setConfigPath: store.setConfigFilePath,
		getConfigPath: () => store.state().configFilePath,
		getDestinationBasePath: () => store.state().destinationBasePath,
	};
}

const configAPI = {
	get: configApi,
};
export { configAPI };
