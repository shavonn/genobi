import type { Operation } from "../../types/operation";
import { amendFile, append, prepend } from "./amend";
import { create } from "./create";

async function runOperation(operation: Operation, data: Record<string, any>) {
	switch (operation.type) {
		case "append":
			await operations.append(operation, data);
			break;
		case "create":
			await operations.create(operation, data);
			break;
		case "createAll":
			console.log("createAll", operation, data);
			break;
		case "prepend":
			await operations.prepend(operation, data);
			break;
		default:
			throw new Error(`Unknown operation type: ${(operation as any).type}`);
	}
}

const operations = { amendFile, append, create, prepend, runOperation };
export { operations };
