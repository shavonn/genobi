import { UnknownOperationType } from "../../errors";
import type { AmendOperation, CreateAllOperation, CreateOperation, Operation } from "../../types/operation";

function decorateOperation(operation: Operation): AmendOperation | CreateOperation | CreateAllOperation {
	let decoratedOp: Operation;

	switch (operation.type) {
		case "append":
		case "prepend":
			decoratedOp = amendDecorator(operation);
			break;
		case "create":
			decoratedOp = createDecorator(operation);
			break;
		case "createAll":
			decoratedOp = createAllDecorator(operation);
			break;
		default:
			throw new UnknownOperationType((operation as any).type);
	}

	return decoratedOp;
}

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
	decorate: decorateOperation,
	create: createDecorator,
	createAll: createAllDecorator,
	amend: amendDecorator,
};
export { operationDecorators };
