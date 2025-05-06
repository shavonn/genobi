import fs from "node:fs/promises";
import type { SingleFileOperation } from "../types/operation";
import { logger } from "./logger";
import { pathDir } from "./path-dir";

export async function getSingleFileContent(operation: SingleFileOperation, data: Record<string, any>): Promise<string> {
	let content: string;

	if (operation.templateFilePath) {
		const templatePath = pathDir.getTemplateProcessedPath(operation.templateFilePath, data);
		try {
			content = await fs.readFile(templatePath, "utf8");
		} catch (error) {
			logger.error(`Error reading template file: ${templatePath}`);
			throw error;
		}
	} else if (operation.templateStr) {
		content = operation.templateStr;
	} else {
		logger.error("No template string or file found");
		throw new Error("Either templateFile(s) or templateStr must be provided");
	}

	return content;
}

const content = {
	getSingleFileContent,
};
export { content };
