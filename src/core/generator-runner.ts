import inquirer from "inquirer";
import { store } from "../config-store";
import { helperRegister } from "../utils/helpers/helper-register";
import { operations } from "./operations";

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

		switch (operation.type) {
			case "append":
				console.log("append", operation, data);
				break;
			case "create":
				await operations.create(operation, data);
				break;
			case "createAll":
				console.log("createAll", operation, data);
				break;
			case "prepend":
				console.log("prepend", operation, data);
				break;
			default:
				throw new Error(`Unknown operation type: ${(operation as any).type}`);
		}
	}
}

const generatorRunner = {
	run: runGenerator,
};
export { generatorRunner };
