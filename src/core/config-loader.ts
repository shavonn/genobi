// src/core/config-loader.ts
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
const configFilePatterns = [
  `${packageName}.config.js`,
  `${packageName}.config.ts`,
  `${packageName}.config.mjs`,
  `${packageName}.config.cjs`,
];

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
async function loadConfig(destination?: string): Promise<void> {
  logger.info("Loading configuration");
  logger.debug(`Search patterns: ${configFilePatterns.join(", ")}`);
  logger.debug(`Search strategy: ${common.isGlobalInstall() ? "global" : "project"}`);

  // Create a cosmiconfig explorer to find the config file
  const explorer = cosmiconfig(packageName, {
    searchStrategy: common.isGlobalInstall() ? "global" : "project",
    searchPlaces: configFilePatterns,
  });

  // Search for the config file
  logger.info("Searching for config file");
  const result = await explorer.search();

  // Handle case where no config file is found
  if (result === null) {
    logger.error("No config file found");
    throw new ConfigLoadError(
      "Config file not found. Create one to define your generators, helpers, and other options.",
    );
  }

  // Extract config information
  const { config: loadConfig, filepath, isEmpty } = result;
  logger.info(`Found config file: ${filepath}`);
  logger.debug(`Config file ${isEmpty ? "is" : "is not"} empty`);

  // Validate config format
  if (isEmpty || typeof loadConfig !== "function") {
    logger.error("Invalid config file format");
    throw new ConfigLoadError(`Config file invalid. It must export a default function: ${filepath}.`);
  }

  // Set up configuration paths
  logger.info("Setting up configuration paths");
  store.setConfigFilePath(filepath);

  const basePath = destination || store.state().configPath;
  logger.debug(`Setting destination base path: ${basePath}`);
  store.setDestinationBasePath(basePath);

  // Execute the config function with the Genobi API
  try {
    logger.info("Executing config function");
    await loadConfig(configAPI.get());
    logger.info("Config function executed successfully");
  } catch (err) {
    const message = common.getErrorMessage(err);
    logger.error(`Error in config function: ${message}`);
    logger.debug(`Error details: ${common.isErrorWithStack(err) ? err.stack : "No stack trace available"}`);

    const enhancedError = new ConfigLoadError(`Error in config loading. ${message}`, err);

    logger.debug("Original error stack:", common.isErrorWithStack(err) ? err.stack : "N/A");
    throw enhancedError;
  }

  // Check that at least one generator is defined
  const generators = store.getGeneratorsList();
  logger.info(`Found ${generators.length} generators`);

  if (generators.length > 0) {
    logger.debug(`Generator IDs: ${generators.map((g) => g.value).join(", ")}`);
  }

  if (generators.length === 0) {
    logger.error("No generators found in configuration");
    throw new ConfigLoadError(
      "No generators were found in the loaded configuration. Please define at least one generator.",
    );
  }

  // Log helper and partial counts
  logger.debug(`Registered ${store.state().helpers.size} helpers`);
  if (store.state().helpers.size > 0) {
    logger.debug(`Helper names: ${Array.from(store.state().helpers.keys()).join(", ")}`);
  }

  logger.debug(`Registered ${store.state().partials.size} partials`);
  if (store.state().partials.size > 0) {
    logger.debug(`Partial names: ${Array.from(store.state().partials.keys()).join(", ")}`);
  }

  logger.debug("Configuration state:", store.state());
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
