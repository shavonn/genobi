import path from "node:path";
import { store } from "../../config-store.js";
import { GenobiError } from "../../errors.js";
import type { CustomOperation, OperationContext, TemplateData } from "../../types/operation.js";
import { fileSys } from "../../utils/file-sys.js";
import { logger } from "../../utils/logger.js";

/**
 * Creates the context object for custom operations.
 * Provides utilities and information about the current execution context.
 *
 * @returns {OperationContext} The operation context
 */
function createContext(): OperationContext {
  const state = store.state();

  return {
    destinationPath: state.destinationBasePath,
    configPath: state.configPath,
    logger: {
      info: logger.info,
      warn: logger.warn,
      error: logger.error,
      debug: logger.debug,
      success: logger.success,
    },
    replaceInFile: async (filePath: string, pattern: string | RegExp, replacement: string): Promise<void> => {
      const fullPath = path.resolve(state.destinationBasePath, filePath);
      logger.debug(`Replacing content in file: ${fullPath}`);
      logger.debug(`Pattern: ${pattern}`);

      const content = await fileSys.readFromFile(fullPath);
      const newContent = content.replace(pattern, replacement);

      if (content === newContent) {
        logger.debug("No changes made to file (pattern not found or replacement identical)");
        return;
      }

      await fileSys.writeToFile(fullPath, newContent);
      logger.info(`Replaced content in: ${fullPath}`);
    },
  };
}

/**
 * Executes a custom operation with an inline action function.
 *
 * This function will:
 * 1. Create the operation context with utilities
 * 2. Execute the action function with data and context
 * 3. Handle both sync and async returns
 *
 * @param {CustomOperation} operation - The custom operation configuration
 * @param {TemplateData} data - The data from prompts and operation data
 * @returns {Promise<void>}
 */
async function custom(operation: CustomOperation, data: TemplateData): Promise<void> {
  logger.info(`Running custom operation: ${operation.name}`);

  const context = createContext();

  // Execute the action - handle both sync and async returns
  const result = operation.action(data, context);
  if (result instanceof Promise) {
    await result;
  }

  logger.success(`Custom operation completed: ${operation.name}`);
}

/**
 * Executes a registered operation by name.
 *
 * This function will:
 * 1. Look up the handler in the store
 * 2. Create the operation context with utilities
 * 3. Execute the handler with data and context
 *
 * @param {string} operationType - The name of the registered operation
 * @param {TemplateData} data - The data from prompts and operation data
 * @returns {Promise<void>}
 * @throws {GenobiError} If the operation is not registered
 */
async function registered(operationType: string, data: TemplateData): Promise<void> {
  logger.info(`Running registered operation: ${operationType}`);

  const handler = store.state().operations.get(operationType);
  if (!handler) {
    throw new GenobiError("UNKNOWN_OPERATION_TYPE", `Operation "${operationType}" is not registered`);
  }

  const context = createContext();

  // Execute the handler - handle both sync and async returns
  const result = handler(data, context);
  if (result instanceof Promise) {
    await result;
  }

  logger.success(`Registered operation completed: ${operationType}`);
}

export { custom, registered };
