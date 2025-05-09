import { UnknownOperationType } from "../../errors";
import type { AmendOperation, CreateAllOperation, CreateOperation, Operation } from "../../types/operation";

export function OpDecorator(operation: Operation) {
	return Object.assign(
		{
			data: {},
			haltOnError: true,
		},
		operation,
	) as Operation;
}

export function createDecorator(operation: CreateOperation) {
	return Object.assign(
		{
			skipIfExists: false,
			overwrite: false,
			skip: false,
		},
		OpDecorator(operation),
	) as CreateOperation;
}

export function createAllDecorator(operation: CreateAllOperation) {
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

export function amendDecorator(operation: AmendOperation) {
	return Object.assign(
		{
			unique: true,
			separator: "\n",
		},
		OpDecorator(operation),
	) as AmendOperation;
}

const operationDecorators = {
	append: (operation: AmendOperation) => amendDecorator(operation),
	prepend: (operation: AmendOperation) => amendDecorator(operation),
	create: (operation: CreateOperation) => createDecorator(operation),
	createAll: (operation: CreateAllOperation) => createAllDecorator(operation),
};

function isValidOperationType(type: string): type is keyof typeof operationDecorators {
	return type in operationDecorators;
}

function decorateOperation(operation: Operation) {
	if (isValidOperationType(operation.type)) {
		return operationDecorators[operation.type](operation as any);
	}
	throw new UnknownOperationType(operation.type);
}

const operationDecorator = {
	decorate: decorateOperation,
	create: createDecorator,
	createAll: createAllDecorator,
	amend: amendDecorator,
};
export { operationDecorator };
