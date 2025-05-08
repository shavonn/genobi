import inquirer from "inquirer";
import { store } from "../config-store";
import { GenobiError, UnknownOperationType } from "../errors";
import { stringHelpers } from "../utils/helpers/string-transformers";
import { logger } from "../utils/logger";
import { templateAssetRegister } from "../utils/template-asset-register";
import { operationDecorators } from "./operations/operation-decorators";
import { ops } from "./operations/ops";

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
		const operation = operationDecorators.decorate(op);

		const data = { ...input, ...(operation.data || {}) };

		if (typeof operation.skip === "function" && operation.skip(data)) {
			continue;
		}

		try {
			if (operation.type === "append") {
				await ops.append(operation, data);
			} else if (operation.type === "create") {
				await ops.create(operation, data);
			} else if (operation.type === "createAll") {
				await ops.createAll(operation, data);
			} else if (operation.type === "prepend") {
				await ops.prepend(operation, data);
			} else {
				throw new UnknownOperationType((operation as any).type);
			}
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
