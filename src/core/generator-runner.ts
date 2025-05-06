import inquirer from "inquirer";
import { store } from "../config-store";
import { helperRegister } from "../utils/helpers/helper-register";
import { stringHelpers } from "../utils/helpers/string-transformers";
import { logger } from "../utils/logger";
import { operations } from "./operations/operation-runner";

async function runGenerator() {
	helperRegister.register();

	const generator = store.state().generators.get(store.state().selectedGenerator);

	let input: Record<string, any> = {};

	if (generator?.prompts && generator.prompts.length > 0) {
		input = await inquirer.prompt(generator.prompts);
	}

	if (!generator?.operations || generator.operations.length === 0) {
		throw new Error(`No operations found for ${store.state().selectedGenerator}`);
	}

	for (const operation of generator.operations) {
		const data = { ...input, ...(operation.data || {}) };

		if (typeof operation.skip === "function" && operation.skip(data)) {
			continue;
		}

		try {
			await operations.runOperation(operation, data);
		} catch (err) {
			logger.error(`${stringHelpers.titleCase(operation.type)} operation failed for:`, err);
			if (operation.haltOnError) {
				throw err;
			}
		}
	}
}

const generatorRunner = {
	run: runGenerator,
};
export { generatorRunner };
