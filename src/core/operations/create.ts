import type { CreateOperation } from "../../types/operation";

async function create(operation: CreateOperation, data: Record<string, any>): Promise<void> {
	console.log("Create operation...", operation, data);
}

export { create };
