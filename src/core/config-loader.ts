import { cosmiconfig } from "cosmiconfig";
import pkg from "../../package.json";
import { configAPI } from "../config-api";
import { store } from "../config-store";
import { ConfigLoadError } from "../errors";
import { common } from "../utils/common";
import { logger } from "../utils/logger";

const packageName = pkg.name;

/**
 * List of file patterns to search for when looking for the config file.
 * Supports JavaScript, TypeScript, and ESM/CJS variants.
 */
const configFilePatterns = [`${packageName}.js`, `${packageName}.ts`, `${packageName}.mjs`, `${packageName}.cjs`];

/**
 * Loads the Genobi configuration from a file.
 *
 * This function:
 * 1. Searches for a config file using cosmiconfig
 * 2. Validates the config file format
 * 3. Executes the config function with the Genobi API
 * 4. Checks that at least one generator is defined
 *
 * @param {string} [destination] - Optional destination path for file operations
 * @returns {Promise<void>}
 * @throws {ConfigLoadError} If the config file is not found, invalid, or has errors
 */
async function loadConfig(destination?: string) {
	// Create a cosmiconfig explorer to find the config file
	const explorer = cosmiconfig(packageName, {
		searchStrategy: common.isGlobalInstall() ? "global" : "project",
		searchPlaces: configFilePatterns,
	});

	// Search for the config file
	const result = await explorer.search();

	// Handle case where no config file is found
	if (result === null) {
		throw new ConfigLoadError(
			"Config file not found. Create one to define your generators, helpers, and other options.",
		);
	}

	// Extract config information
	const { config: loadConfig, filepath, isEmpty } = result;

	// Validate config format
	if (isEmpty || typeof loadConfig !== "function") {
		throw new ConfigLoadError(`Config file invalid. It must export a default function: ${filepath}.`);
	}

	// Set up configuration paths
	store.setConfigFilePath(filepath);
	store.setDestinationBasePath(destination || store.state().configPath);

	// Execute the config function with the Genobi API
	try {
		await loadConfig(configAPI.get());
	} catch (err: any) {
		const enhancedError = new ConfigLoadError(`Error in config loading. ${err.message}`);
		enhancedError.cause = err;

		logger.debug("Original error stack:", err.stack);
		throw enhancedError;
	}

	// Check that at least one generator is defined
	const generators = store.getGeneratorsList();
	if (generators.length === 0) {
		throw new ConfigLoadError(
			"No generators were found in the loaded configuration. Please define at least one generator.",
		);
	}

	logger.debug("Configuration loaded from file:", store.state());
}

/**
 * Utility for loading the Genobi configuration.
 */
const configLoader = {
	/**
	 * Loads the Genobi configuration from a file.
	 *
	 * @param {string} [destination] - Optional destination path for file operations
	 * @returns {Promise<void>}
	 */
	load: loadConfig,
};
export { configLoader };
