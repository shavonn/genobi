import inquirer from "inquirer";
import { store } from "../config-store";
import { logger } from "../utils/logger";

/**
 * Resolves which generator to use for the current operation.
 *
 * This function:
 * 1. Checks if a generator ID was provided
 * 2. Validates that the provided generator exists
 * 3. If no valid generator is selected, prompts the user to choose one
 *
 * @returns {Promise<void>}
 */
async function resolveGenerator(): Promise<void> {
	// Start with the currently selected generator (if any)
	let selectedGenerator: string = store.state().selectedGenerator;

	// Validate the selected generator exists
	if (selectedGenerator !== "") {
		const generatorExists = store.state().generators.has(selectedGenerator);
		if (!generatorExists) {
			selectedGenerator = "";
			logger.error(`Generator with ID "${store.state().selectedGenerator}" not found.`);
		}
	}

	// If no valid generator is selected, prompt the user to choose one
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

/**
 * Utility for resolving which generator to use.
 */
const generatorResolver = {
	/**
	 * Resolves which generator to use for the current operation.
	 *
	 * @returns {Promise<void>}
	 */
	resolve: resolveGenerator,
};
export { generatorResolver };
