import { store } from "../../config-store";
import { GenobiError } from "../../errors";
import type { GeneratorConfig } from "../../types/generator";
import type { ForManyOperation } from "../../types/operation";
import { stringHelpers } from "../../utils/helpers/string-transformers";
import { logger } from "../../utils/logger";
import { operationHandler } from "../operation-handler";
import { operationDecorator } from "./operation-decorator";

/**
 * Executes a forMany operation to run a generator multiple times with different data.
 *
 * This function will:
 * 1. Get the items array (either directly or by calling the items function)
 * 2. For each item in the array:
 *    a. Transform the item data if a transformItem function is provided
 *    b. Merge the item data with parent data
 *    c. Run all operations of the target generator with the merged data
 *
 * @param {ForManyOperation} operation - The forMany operation configuration
 * @param {Record<string, any>} data - The parent data from prompts
 * @returns {Promise<void>}
 * @throws {GenobiError} If the specified generator is not found
 */
export async function forMany(operation: ForManyOperation, data: Record<string, any>): Promise<void> {
	// Get the generator configuration
	const generator = store.state().generators.get(operation.generatorId);
	if (!generator) {
		throw new GenobiError(
			"GENERATOR_NOT_FOUND",
			`Generator "${operation.generatorId}" referenced in forMany operation was not found.`,
		);
	}

	// Check that the generator has operations
	if (!generator.operations || generator.operations.length === 0) {
		throw new GenobiError("MISSING_OPERATIONS_ERROR", `No operations found for generator "${operation.generatorId}".`);
	}

	// Get the items array
	const items = typeof operation.items === "function" ? operation.items(data) : operation.items;

	if (!Array.isArray(items)) {
		throw new GenobiError(
			"INVALID_FOR_MANY_ITEMS",
			`The "items" property must be an array or a function that returns an array.`,
		);
	}

	logger.info(`Running forMany operation with ${items.length} items using generator "${operation.generatorId}"`);

	// Process each item
	for (let index = 0; index < items.length; index++) {
		const item = items[index];

		// Transform the item data if needed
		let itemData = item;
		if (operation.transformItem) {
			itemData = operation.transformItem(item, index, data);
		}

		// Merge with parent data
		const mergedData = { ...data, ...itemData };

		logger.info(`Processing item ${index + 1}/${items.length}: ${JSON.stringify(itemData)}`);

		// Process each operation in the target generator
		await processGeneratorOperations(
			generator,
			mergedData,
			operation.haltOnError !== undefined ? operation.haltOnError : true,
		);
	}

	logger.success(`ForMany operation completed with ${items.length} items`);
}

/**
 * Processes all operations of a generator with the provided data.
 *
 * @param {GeneratorConfig} generator - The generator configuration
 * @param {Record<string, any>} data - The data to use for template processing
 * @param {boolean} haltOnError - Whether to stop execution on error
 * @returns {Promise<void>}
 */
async function processGeneratorOperations(
	generator: GeneratorConfig,
	data: Record<string, any>,
	haltOnError: boolean,
): Promise<void> {
	// Process each operation
	for (const op of generator.operations) {
		// Apply defaults and enhancements to the operation
		const operation = operationDecorator.decorate(op);

		// Merge input data with operation-specific data
		const opData = { ...(operation.data || {}), ...data };

		// Check if the operation should be skipped
		if (typeof operation.skip === "function" && (await operation.skip(opData))) {
			continue;
		}

		// Execute the operation and handle errors
		try {
			await operationHandler.handle(operation, opData);
		} catch (err: any) {
			logger.error(
				`[${stringHelpers.upperCase(stringHelpers.sentenceCase(operation.type))}] Operation failed.`,
				err.message,
			);
			if (err.cause) {
				logger.error(err.cause.message);
			}
			// If haltOnError is true, rethrow the error to stop execution
			if (haltOnError) {
				throw err;
			}
		}
	}
}
