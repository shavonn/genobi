import inquirer from "inquirer";
import { store } from "../config-store";
import { GenobiError } from "../errors";
import { common } from "../utils/common";
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
  logger.info(`Starting generator: ${store.state().selectedGenerator}`);

  // Register handlebars helpers and partials
  logger.info("Registering templates components");
  templates.registerComponents();
  logger.debug(`Registered ${store.state().helpers.size} helpers and ${store.state().partials.size} partials`);

  // Get the selected generator
  const generator = store.state().generators.get(store.state().selectedGenerator);
  logger.info(`Loaded generator: ${generator?.description}`);

  // Initialize input data
  let input: Record<string, any> = {};

  // Prompt the user for input if the generator has prompts
  if (generator?.prompts && generator.prompts.length > 0) {
    logger.info(`Prompting for ${generator.prompts.length} input value(s)`);
    input = await inquirer.prompt(generator.prompts);
    logger.debug(`User input: ${JSON.stringify(input, null, 2)}`);
  } else {
    logger.info("No prompts defined for this generator");
  }

  // Check that the generator has operations
  if (!generator?.operations || generator.operations.length === 0) {
    logger.error(`No operations found for ${store.state().selectedGenerator}`);
    throw new GenobiError("MISSING_OPERATIONS_ERROR", `No operations found for ${store.state().selectedGenerator}`);
  }

  logger.info(`Running ${generator.operations.length} operations`);

  // Process each operation
  for (const op of generator.operations) {
    // Apply defaults and enhancements to the operation
    const operation = operationDecorator.decorate(op);
    logger.info(`Executing operation: ${operation.type}`);
    logger.debug(
      `Operation config: ${JSON.stringify(
        {
          type: operation.type,
          haltOnError: operation.haltOnError,
          hasSkipFunction: typeof operation.skip === "function",
        },
        null,
        2,
      )}`,
    );

    // Merge input data with operation-specific data
    const data = { ...input, ...(operation.data || {}) };
    logger.debug(`Merged operation data keys: ${Object.keys(data).join(", ")}`);

    // Check if the operation should be skipped
    if (typeof operation.skip === "function") {
      logger.info("Evaluating skip condition");
      const shouldSkip = await operation.skip(data);
      if (shouldSkip) {
        logger.info("Skipping operation due to skip condition");
        continue;
      }
    }

    // Execute the operation and handle errors
    try {
      logger.info(`Running ${operation.type} operation`);
      await operationHandler.handle(operation, data);
      logger.info("Operation completed successfully");
    } catch (err) {
      logger.error(
        `${stringHelpers.titleCase(stringHelpers.sentenceCase(operation.type))} Operation failed.`,
        common.getErrorMessage(err),
      );
      if (common.isErrorWithMessage(err) && err instanceof Error && err.cause) {
        logger.error(common.getErrorMessage(err.cause));
      }
      logger.debug(`Error details: ${common.isErrorWithStack(err) ? err.stack : "No stack trace available"}`);

      // If haltOnError is true, rethrow the error to stop execution
      if (operation.haltOnError) {
        logger.debug("haltOnError is true, stopping execution");
        throw err;
      }
      logger.debug("haltOnError is false, continuing with next operation");
    }
  }

  logger.success(`Completed generator: ${store.state().selectedGenerator}`);
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
