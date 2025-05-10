import { UnknownOperationType } from "../../errors";
import type { AmendOperation, CreateAllOperation, CreateOperation, Operation } from "../../types/operation";

/**
 * Adds common default properties to any operation type.
 *
 * @param {Operation} operation - The operation to decorate
 * @returns {Operation} The operation with default properties applied
 */
export function OpDecorator(operation: Operation): Operation {
	return Object.assign(
		{
			data: {},
			haltOnError: true,
		},
		operation,
	) as Operation;
}

/**
 * Adds default properties specific to create operations.
 *
 * @param {CreateOperation} operation - The create operation to decorate
 * @returns {CreateOperation} The operation with default properties applied
 */
export function createDecorator(operation: CreateOperation): CreateOperation {
	return Object.assign(
		{
			skipIfExists: false,
			overwrite: false,
			skip: false,
		},
		OpDecorator(operation),
	) as CreateOperation;
}

/**
 * Adds default properties specific to createAll operations.
 *
 * @param {CreateAllOperation} operation - The createAll operation to decorate
 * @returns {CreateAllOperation} The operation with default properties applied
 */
export function createAllDecorator(operation: CreateAllOperation): CreateAllOperation {
	return Object.assign(
		{
			skipIfExists: false,
			overwrite: false,
			skip: false,
			verbose: true,
		},
		OpDecorator(operation),
	) as unknown as CreateAllOperation;
}

/**
 * Adds default properties specific to append/prepend operations.
 *
 * @param {AmendOperation} operation - The amend operation to decorate
 * @returns {AmendOperation} The operation with default properties applied
 */
export function amendDecorator(operation: AmendOperation): AmendOperation {
	return Object.assign(
		{
			unique: true,
			separator: "\n",
		},
		OpDecorator(operation),
	) as AmendOperation;
}

/**
 * Map of operation types to their decorator functions.
 */
const operationDecorators = {
	append: (operation: AmendOperation) => amendDecorator(operation),
	prepend: (operation: AmendOperation) => amendDecorator(operation),
	create: (operation: CreateOperation) => createDecorator(operation),
	createAll: (operation: CreateAllOperation) => createAllDecorator(operation),
};

/**
 * Type guard to check if an operation type is valid.
 *
 * @param {string} type - The operation type to check
 * @returns {boolean} True if the operation type is valid
 */
function isValidOperationType(type: string): type is keyof typeof operationDecorators {
	return type in operationDecorators;
}

/**
 * Decorates an operation with default values based on its type.
 *
 * @param {Operation} operation - The operation to decorate
 * @returns {Operation} The decorated operation with default values
 * @throws {UnknownOperationType} If the operation type is not recognized
 */
function decorateOperation(operation: Operation): Operation {
	if (isValidOperationType(operation.type)) {
		return operationDecorators[operation.type](operation as any);
	}
	throw new UnknownOperationType(operation.type);
}

/**
 * Utilities for decorating operations with default values.
 */
const operationDecorator = {
	/**
	 * Decorates an operation with default values based on its type.
	 *
	 * @param {Operation} operation - The operation to decorate
	 * @returns {Operation} The decorated operation with default values
	 */
	decorate: decorateOperation,

	/**
	 * Decorates a create operation with default values.
	 *
	 * @param {CreateOperation} operation - The create operation to decorate
	 * @returns {CreateOperation} The decorated operation
	 */
	create: createDecorator,

	/**
	 * Decorates a createAll operation with default values.
	 *
	 * @param {CreateAllOperation} operation - The createAll operation to decorate
	 * @returns {CreateAllOperation} The decorated operation
	 */
	createAll: createAllDecorator,

	/**
	 * Decorates an amend operation (append/prepend) with default values.
	 *
	 * @param {AmendOperation} operation - The amend operation to decorate
	 * @returns {AmendOperation} The decorated operation
	 */
	amend: amendDecorator,
};
export { operationDecorator };
