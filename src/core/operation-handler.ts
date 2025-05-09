import { UnknownOperationType } from "../errors";
import type { AmendOperation, CreateAllOperation, CreateOperation, Operation } from "../types/operation";
import { ops } from "./operations/ops";

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
};

/**
 * Type guard to check if an operation type is valid.
 *
 * @param {string} type - The operation type to check
 * @returns {boolean} True if the operation type is valid
 */
function isValidOperationType(type: string): type is keyof typeof operationHandlers {
	return type in operationHandlers;
}

/**
 * Handles an operation by dispatching it to the appropriate handler function.
 *
 * @param {Operation} operation - The operation to handle
 * @param {Record<string, any>} data - Data for template processing
 * @returns {Promise<any>} The result of the operation
 * @throws {UnknownOperationType} If the operation type is not recognized
 */
function handleOperation(operation: Operation, data: Record<string, any>) {
	if (isValidOperationType(operation.type)) {
		return operationHandlers[operation.type](operation as any, data);
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
