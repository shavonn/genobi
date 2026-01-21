import { store } from "../config-store.js";
import { UnknownOperationType } from "../errors.js";
import type {
  AmendOperation,
  CreateAllOperation,
  CreateOperation,
  CustomOperation,
  ForManyOperation,
  Operation,
} from "../types/operation.js";
import * as customOps from "./operations/custom.js";
import { ops } from "./operations/ops.js";

/**
 * Map of operation types to their handler functions.
 */
const operationHandlers = {
  /**
   * Handler for append operations.
   *
   * @param {AmendOperation} operation - The append operation configuration
   * @param {Record<string, any>} data - Data for template processing
   */
  append: (operation: AmendOperation, data: Record<string, any>) => ops.append(operation, data),

  /**
   * Handler for prepend operations.
   *
   * @param {AmendOperation} operation - The prepend operation configuration
   * @param {Record<string, any>} data - Data for template processing
   */
  prepend: (operation: AmendOperation, data: Record<string, any>) => ops.prepend(operation, data),

  /**
   * Handler for create operations.
   *
   * @param {CreateOperation} operation - The create operation configuration
   * @param {Record<string, any>} data - Data for template processing
   */
  create: (operation: CreateOperation, data: Record<string, any>) => ops.create(operation, data),

  /**
   * Handler for createAll operations.
   *
   * @param {CreateAllOperation} operation - The createAll operation configuration
   * @param {Record<string, any>} data - Data for template processing
   */
  createAll: (operation: CreateAllOperation, data: Record<string, any>) => ops.createAll(operation, data),

  /**
   * Handler for forMany operations.
   *
   * @param {ForManyOperation} operation - The forMany operation configuration
   * @param {Record<string, any>} data - Data for template processing
   */
  forMany: (operation: ForManyOperation, data: Record<string, any>) => ops.forMany(operation, data),

  /**
   * Handler for custom operations.
   *
   * @param {CustomOperation} operation - The custom operation configuration
   * @param {Record<string, any>} data - Data for template processing
   */
  custom: (operation: CustomOperation, data: Record<string, any>) => customOps.custom(operation, data),
};

/**
 * Checks if an operation type is a built-in type.
 *
 * @param {string} type - The operation type to check
 * @returns {boolean} True if the operation type is built-in
 */
function isBuiltInType(type: string): type is keyof typeof operationHandlers {
  return type in operationHandlers;
}

/**
 * Checks if an operation type is a registered custom operation.
 *
 * @param {string} type - The operation type to check
 * @returns {boolean} True if the operation type is registered
 */
function isRegisteredType(type: string): boolean {
  return store.state().operations.has(type);
}

/**
 * Handles an operation by dispatching it to the appropriate handler function.
 * Supports both built-in operations and registered custom operations.
 *
 * @param {Operation} operation - The operation to handle
 * @param {Record<string, any>} data - Data for template processing
 * @returns {Promise<any>} The result of the operation
 * @throws {UnknownOperationType} If the operation type is not recognized
 */
function handleOperation(operation: Operation, data: Record<string, any>): Promise<any> {
  // Handle built-in operation types
  if (isBuiltInType(operation.type)) {
    return operationHandlers[operation.type](operation as any, data);
  }

  // Handle registered custom operations
  if (isRegisteredType(operation.type)) {
    return customOps.registered(operation.type, data);
  }

  throw new UnknownOperationType(operation.type);
}

/**
 * Utility for handling different types of operations.
 */
const operationHandler = {
  /**
   * Handles an operation by dispatching it to the appropriate handler function.
   *
   * @param {Operation} operation - The operation to handle
   * @param {Record<string, any>} data - Data for template processing
   * @returns {Promise<any>} The result of the operation
   */
  handle: handleOperation,
};
export { operationHandler };
