import { Command, Option } from "commander";
import pkg from "../../package.json";
import { store } from "../config-store";
import { logger } from "../utils/logger";
import { configLoader } from "./config-loader";
import { generatorResolver } from "./generator-resolver";
import { generatorRunner } from "./generator-runner";

/**
 * Runs the CLI application.
 *
 * This function:
 * 1. Sets up the command-line interface using Commander
 * 2. Processes command-line arguments and options
 * 3. Loads the configuration
 * 4. Resolves which generator to use
 * 5. Runs the selected generator
 * 6. Handles any errors that occur
 *
 * @returns {Promise<void>}
 */
async function runCli(): Promise<void> {
	// Create a new Commander instance
	const program = new Command(pkg.name);

	// Configure the CLI program
	program
		.version(pkg.version)
		.description(pkg.description)
		.argument(
			"[generator]",
			"ID for selecting the generator to use. This ID corresponds to a generator defined in your configuration file.",
		)
		.option(
			"-d --destination <string>",
			"The directory used as the reference point for resolving all relative paths. Usually your project root.",
		)
		.option("-v --verbose <string>", "Logs operation activities as they are completed.");

	// Add a hidden debug option
	program.addOption(new Option("--debug").hideHelp());

	// Parse command-line arguments
	program.parse(process.argv);

	// Extract the generator argument if provided
	const [generatorArg] = program.args;

	// Extract options
	const { debug, destination, verbose } = program.opts();

	// Set the selected generator if provided
	if (generatorArg) {
		logger.debug("Provided generator ID arg:", generatorArg);
		store.setSelectedGenerator(generatorArg);
	}

	// Log the destination if provided
	if (destination) {
		logger.debug("Provided destination option:", destination);
	}

	// Enable debug logging if requested
	if (debug) {
		logger.debug("Debug logging enabled");
		store.enableDebugLogging();
	}

	// Enable verbose logging if requested
	if (verbose) {
		logger.debug("Verbose logging enabled");
		store.enableVerboseLogging();
	}

	// Run the main application flow
	try {
		// Load the configuration
		await configLoader.load(destination);

		// Resolve which generator to use
		await generatorResolver.resolve();

		// Run the selected generator
		await generatorRunner.run();
	} catch (err: any) {
		// Log the error message
		logger.error(`Error: ${err.message}`);

		// Log additional details about the error cause if available
		if (err.cause) {
			if (err.cause.message) {
				logger.error(`Caused by: ${err.cause.message}`);
			}
			if (err.cause.message) {
				logger.debug(`Original error stack: ${err.cause.stack}`);
			}
		}

		// Exit with a non-zero status code to indicate failure
		process.exit(1);
	}
}

/**
 * CLI interface for running Genobi.
 */
const cli = {
	/**
	 * Runs the CLI application.
	 *
	 * @returns {Promise<void>}
	 */
	run: runCli,
};
export { cli };
