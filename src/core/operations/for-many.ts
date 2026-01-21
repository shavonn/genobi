import { store } from "../../config-store";
import { GenobiError } from "../../errors";
import type { GeneratorConfig } from "../../types/generator";
import type { ForManyOperation } from "../../types/operation";
import { common } from "../../utils/common";
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
  logger.info(`Looking for generator: "${operation.generatorId}"`);
  const generator = store.state().generators.get(operation.generatorId);
  if (!generator) {
    throw new GenobiError(
      "GENERATOR_NOT_FOUND",
      `Generator "${operation.generatorId}" referenced in forMany operation was not found.`,
    );
  }
  logger.info(`Generator found: ${generator.description}`);
  logger.debug(
    `Generator config: ${JSON.stringify(
      {
        description: generator.description,
        operations: generator.operations.length,
        hasPrompts: generator.prompts?.length > 0,
      },
      null,
      2,
    )}`,
  );

  // Check that the generator has operations
  if (!generator.operations || generator.operations.length === 0) {
    throw new GenobiError("MISSING_OPERATIONS_ERROR", `No operations found for generator "${operation.generatorId}".`);
  }
  logger.info(`Generator has ${generator.operations.length} operations`);

  // Get the items array
  logger.info("Getting items for ForMany operation");
  const items = typeof operation.items === "function" ? operation.items(data) : operation.items;

  if (typeof operation.items === "function") {
    logger.debug("Items provided by function");
  } else {
    logger.debug("Items provided directly as array");
  }

  if (!Array.isArray(items)) {
    throw new GenobiError(
      "INVALID_FOR_MANY_ITEMS",
      `The "items" property must be an array or a function that returns an array.`,
    );
  }

  logger.info(`Running generator for ${items.length} items`);

  if (operation.transformItem) {
    logger.debug("Item transformation function provided");
  }

  // Process each item
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item === undefined) {
      continue;
    }
    logger.info(`Processing item ${index + 1} of ${items.length}`);
    logger.debug(`Original item data: ${JSON.stringify(item, null, 2)}`);

    // Transform the item data if needed
    let itemData: Record<string, unknown> =
      typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    if (operation.transformItem) {
      logger.info("Transforming item data");
      const transformed = operation.transformItem(item, index, data);
      itemData =
        typeof transformed === "object" && transformed !== null ? (transformed as Record<string, unknown>) : {};
      logger.debug(`Transformed item data: ${JSON.stringify(itemData, null, 2)}`);
    }

    // Merge with parent data
    const mergedData = { ...data, ...itemData };
    logger.debug(`Merged data: ${JSON.stringify(mergedData, null, 2)}`);

    // Process each operation in the target generator
    await processGeneratorOperations(
      generator,
      mergedData,
      operation.haltOnError !== undefined ? operation.haltOnError : true,
    );

    logger.info(`Completed item ${index + 1} of ${items.length}`);
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
  logger.info(`Processing ${generator.operations.length} operations`);
  logger.debug(`haltOnError setting: ${haltOnError}`);

  // Process each operation
  for (const op of generator.operations) {
    // Apply defaults and enhancements to the operation
    const operation = operationDecorator.decorate(op);
    logger.info(`Executing operation: ${operation.type}`);
    logger.debug(
      `Operation details: ${JSON.stringify(
        {
          type: operation.type,
          haltOnError: operation.haltOnError,
          hasSkipFunction: typeof operation.skip === "function",
          hasData: !!operation.data,
        },
        null,
        2,
      )}`,
    );

    // Merge input data with operation-specific data
    const opData = { ...(operation.data || {}), ...data };
    logger.debug(`Operation data: ${JSON.stringify(operation.data || {}, null, 2)}`);
    logger.debug(`Merged operation data keys: ${Object.keys(opData).join(", ")}`);

    // Check if the operation should be skipped
    if (typeof operation.skip === "function") {
      logger.info("Evaluating skip condition");
      const shouldSkip = await operation.skip(opData);
      if (shouldSkip) {
        logger.info("Skipping operation due to skip condition");
        continue;
      }
    }

    // Execute the operation and handle errors
    try {
      logger.info(`Running ${operation.type} operation`);
      await operationHandler.handle(operation, opData);
      logger.info("Operation completed successfully");
    } catch (err) {
      logger.error(
        `${stringHelpers.titleCase(stringHelpers.sentenceCase(operation.type))} Operation failed.`,
        common.getErrorMessage(err),
      );
      if (err instanceof Error && err.cause) {
        logger.error(common.getErrorMessage(err.cause));
      }
      logger.debug(`Error details: ${common.isErrorWithStack(err) ? err.stack : "No stack trace available"}`);

      // If haltOnError is true, rethrow the error to stop execution
      if (haltOnError) {
        logger.debug("haltOnError is true, stopping execution");
        throw err;
      }
      logger.debug("haltOnError is false, continuing with next operation");
    }
  }

  logger.debug("Completed all operations for generator");
}
