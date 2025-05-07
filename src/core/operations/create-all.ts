import type { CreateAllOperation } from "../../types/operation";

async function createAll(operation: CreateAllOperation, data: Record<string, any>): Promise<void> {
	console.log(operation, data);
}

export { createAll };
