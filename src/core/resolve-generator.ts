import inquirer from "inquirer";
import { store } from "../config-store";
import { logger } from "../utils/logger";

async function resolveGenerator() {
	let selectedGenerator: string = store.state().selectedGenerator;

	if (selectedGenerator !== "") {
		const generatorExists = store.state().generators.has(selectedGenerator);
		if (!generatorExists) {
			selectedGenerator = "";
			logger.error(`Generator with ID "${store.state().selectedGenerator}" not found.`);
		}
	}

	if (selectedGenerator === "") {
		const { generator } = await inquirer.prompt([
			{
				type: "list",
				name: "generator",
				message: store.state().selectionPrompt,
				choices: store.getGeneratorsList(),
			},
		]);

		store.setSelectedGenerator(generator);
	}

	logger.debug("Using selected generator:", store.state().selectedGenerator);
}

const resolver = {
	resolveGenerator,
};
export { resolver };
