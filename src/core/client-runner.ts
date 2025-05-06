import { Command, Option } from "commander";
import pkg from "../../package.json";
import { store } from "../config-store";
import { logger } from "../utils/logger";
import { configLoader } from "./config-loader";
import { generatorResolver } from "./generator-resolver";

async function runCli() {
	const program = new Command(pkg.name);
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

	program.addOption(new Option("--debug").hideHelp());

	program.parse(process.argv);

	const [generatorArg] = program.args;

	const { debug, destination, verbose } = program.opts();

	if (generatorArg) {
		logger.debug("Provided generator ID arg:", generatorArg);
		store.setSelectedGenerator(generatorArg);
	}

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

	try {
		await configLoader.load(destination);
		await generatorResolver.resolve();
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		process.exit(1);
	}
}

const cli = {
	run: runCli,
};
export { cli };
