import fs from "node:fs/promises";
import { GenobiError } from "../errors";
import type { SingleFileOperation } from "../types/operation";
import { logger } from "./logger";
import { pathDir } from "./path-dir";

export async function getSingleFileContent(operation: SingleFileOperation, data: Record<string, any>): Promise<string> {
	let content: string;

	if (operation.templateFilePath) {
		const templatePath = pathDir.getTemplateProcessedPath(operation.templateFilePath, data);
		try {
			content = await fs.readFile(templatePath, "utf8");
		} catch (err) {
			logger.error(`Error reading template file: ${templatePath}`);
			throw err;
		}
	} else if (operation.templateStr) {
		content = operation.templateStr;
	} else {
		logger.error("No template string or template file value found.");
		throw new GenobiError("NO_TEMPLATE_FOUND", "Either templateFile(s) or templateStr must be provided");
	}

	return content;
}

const content = {
	getSingleFileContent,
};
export { content };
