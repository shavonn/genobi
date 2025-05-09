import { UnknownOperationType } from "../errors";
import type { AmendOperation, CreateAllOperation, CreateOperation, Operation } from "../types/operation";
import { ops } from "./operations/ops";

const operationHandlers = {
	append: (operation: AmendOperation, data: Record<string, any>) => ops.append(operation, data),
	prepend: (operation: AmendOperation, data: Record<string, any>) => ops.prepend(operation, data),
	create: (operation: CreateOperation, data: Record<string, any>) => ops.create(operation, data),
	createAll: (operation: CreateAllOperation, data: Record<string, any>) => ops.createAll(operation, data),
};

function isValidOperationType(type: string): type is keyof typeof operationHandlers {
	return type in operationHandlers;
}

function handleOperation(operation: Operation, data: Record<string, any>) {
	if (isValidOperationType(operation.type)) {
		return operationHandlers[operation.type](operation as any, data);
	}
	throw new UnknownOperationType(operation.type);
}

const operationHandler = {
	handle: handleOperation,
};
export { operationHandler };
