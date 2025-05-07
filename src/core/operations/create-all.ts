import type { CreateAllOperation } from "../../types/operation";
import { operationDecorators } from "./operation-decorators";

async function createAll(op: CreateAllOperation, data: Record<string, any>): Promise<void> {
	const operation = operationDecorators.createAll(op);

	console.log(operation, data);
}

export { createAll };
