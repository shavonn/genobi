import inquirer from "inquirer";
import { store } from "../config-store";
import { GenobiError } from "../errors";
import { stringHelpers } from "../utils/helpers/string-transformers";
import { logger } from "../utils/logger";
import { templateAssetRegister } from "../utils/template-asset-register";
import { operationHandler } from "./operation-handler";
import { operationDecorator } from "./operations/operation-decorator";

async function runGenerator() {
	templateAssetRegister.register();

	const generator = store.state().generators.get(store.state().selectedGenerator);

	let input: Record<string, any> = {};

	if (generator?.prompts && generator.prompts.length > 0) {
		input = await inquirer.prompt(generator.prompts);
	}

	if (!generator?.operations || generator.operations.length === 0) {
		throw new GenobiError("MISSING_OPERATIONS_ERROR", `No operations found for ${store.state().selectedGenerator}`);
	}

	for (const op of generator.operations) {
		const operation = operationDecorator.decorate(op);

		const data = { ...input, ...(operation.data || {}) };

		if (typeof operation.skip === "function" && (await operation.skip(data))) {
			continue;
		}

		try {
			await operationHandler.handle(operation, data);
		} catch (err: any) {
			logger.error(`${stringHelpers.sentenceCase(operation.type)} operation failed.`, err.message);
			if (err.cause) {
				logger.error(err.cause.message);
			}
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
