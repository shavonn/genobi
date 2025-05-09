import { cosmiconfig } from "cosmiconfig";
import pkg from "../../package.json";
import { configAPI } from "../config-api";
import { store } from "../config-store";
import { ConfigError } from "../errors";
import { logger } from "../utils/logger";

const packageName = pkg.name;

const configFilePatterns = [`${packageName}.js`, `${packageName}.ts`, `${packageName}.mjs`, `${packageName}.cjs`];

async function loadConfig(destination?: string) {
	const explorer = cosmiconfig(packageName, {
		searchStrategy: "project",
		searchPlaces: configFilePatterns,
	});

	const result = await explorer.search();

	if (result === null) {
		throw new ConfigError("Config file not found. Create one to define your generators, helpers, and other options.");
	}

	const { config: loadConfig, filepath, isEmpty } = result;
	if (isEmpty || typeof loadConfig !== "function") {
		throw new ConfigError(`Config file invalid. It must export a default function: ${filepath}.`);
	}

	store.setConfigFilePath(filepath);
	store.setDestinationBasePath(destination || store.state().configPath);
	try {
		await loadConfig(configAPI.get());
	} catch (error: any) {
		const enhancedError = new ConfigError(`Error in config loading. ${error.message}`);
		enhancedError.cause = error;

		logger.debug("Original error stack:", error.stack);
		throw enhancedError;
	}

	const generators = store.getGeneratorsList();
	if (generators.length === 0) {
		throw new ConfigError(
			"No generators were found in the loaded configuration. Please define at least one generator.",
		);
	}

	logger.debug("Configuration loaded from file:", store.state());
}

const configLoader = {
	load: loadConfig,
};
export { configLoader };
