import { Command, Option } from "commander";
import pkg from "../../package.json";
import { store } from "../config-store";
import { logger } from "../utils/logger";

async function runCli() {
	const program = new Command(pkg.name);
	program
		.version(pkg.version)
		.description(pkg.description)
		.option(
			"-d --destination <string>",
			"The directory used as the reference point for resolving all relative paths. Usually your project root.",
		)
		.option("-v --verbose <string>", "Logs operation activities as they are completed.");

	program.parse(process.argv);

	program.addOption(new Option("--debug").hideHelp());

	const { debug, destination, verbose } = program.opts();

	if (destination) {
		logger.debug("Provided destination option:", destination);
	}

	if (debug) {
		logger.debug("Debug logging enabled");
		store.enableDebugLogging();
	}

	if (verbose) {
		logger.debug("Verbose logging enabled");
		store.enableVerboseLogging();
	}
}

const cli = {
	run: runCli,
};
export { cli };
