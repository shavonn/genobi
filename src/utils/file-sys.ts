import fs from "node:fs/promises";
import path from "node:path";
import { store } from "../config-store";
import { OperationReadError, OperationWriteError } from "../errors";
import { templateProcessor } from "./template-processor";

function getTemplateProcessedPath(templatePath: string, data: Record<string, any>): string {
	const processed = templateProcessor.process(templatePath, data);
	return path.resolve(store.state().destinationBasePath, processed);
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(path.resolve(store.state().destinationBasePath, filePath));
		return true;
	} catch {
		return false;
	}
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
	try {
		await fs.mkdir(path.resolve(store.state().destinationBasePath, dirPath), { recursive: true });
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
			throw err;
		}
	}
}

async function writeToFile(filePath: string, content: string): Promise<void> {
	try {
		await fs.writeFile(filePath, content);
	} catch (err) {
		throw new OperationWriteError(filePath, err);
	}
}

async function readFromFile(filePath: string): Promise<string> {
	let content: string;
	try {
		content = await fs.readFile(filePath, "utf8");
		return content;
	} catch (err) {
		throw new OperationReadError(filePath, err);
	}
}

const fileSys = {
	ensureDirectoryExists,
	fileExists,
	getTemplateProcessedPath,
	writeToFile,
	readFromFile,
};
export { fileSys };
