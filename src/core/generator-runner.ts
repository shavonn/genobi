import inquirer from "inquirer";
import { store } from "../config-store";
import { GenobiError } from "../errors";
import { stringHelpers } from "../utils/helpers/string-transformers";
import { logger } from "../utils/logger";
import { templates } from "../utils/templates";
import { operationHandler } from "./operation-handler";
import { operationDecorator } from "./operations/operation-decorator";

/**
 * Runs the selected generator.
 *
 * This function:
 * 1. Registers template components (helpers and partials)
 * 2. Gets the selected generator configuration
 * 3. Prompts the user for input using the generator's prompts
 * 4. Processes each operation in the generator
 * 5. Handles errors according to each operation's haltOnError setting
 *
 * @returns {Promise<void>}
 * @throws {GenobiError} If the generator has no operations
 * @throws {Error} If an operation fails and haltOnError is true
 */
async function runGenerator(): Promise<void> {
	// Register handlebars helpers and partials
	templates.registerComponents();

	// Get the selected generator
	const generator = store.state().generators.get(store.state().selectedGenerator);

	// Initialize input data
	let input: Record<string, any> = {};

	// Prompt the user for input if the generator has prompts
	if (generator?.prompts && generator.prompts.length > 0) {
		input = await inquirer.prompt(generator.prompts);
	}

	// Check that the generator has operations
	if (!generator?.operations || generator.operations.length === 0) {
		throw new GenobiError("MISSING_OPERATIONS_ERROR", `No operations found for ${store.state().selectedGenerator}`);
	}

	// Process each operation
	for (const op of generator.operations) {
		// Apply defaults and enhancements to the operation
		const operation = operationDecorator.decorate(op);

		// Merge input data with operation-specific data
		const data = { ...input, ...(operation.data || {}) };

		// Check if the operation should be skipped
		if (typeof operation.skip === "function" && (await operation.skip(data))) {
			continue;
		}

		// Execute the operation and handle errors
		try {
			await operationHandler.handle(operation, data);
		} catch (err: any) {
			logger.error(
				`[${stringHelpers.upperCase(stringHelpers.sentenceCase(operation.type))}] Operation failed.`,
				err.message,
			);
			if (err.cause) {
				logger.error(err.cause.message);
			}
			// If haltOnError is true, rethrow the error to stop execution
			if (operation.haltOnError) {
				throw err;
			}
		}
	}
}

/**
 * Utility for running generators.
 */
const generatorRunner = {
	/**
	 * Runs the selected generator.
	 *
	 * @returns {Promise<void>}
	 */
	run: runGenerator,
};
export { generatorRunner };
