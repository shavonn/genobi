import { store } from "../config-store";
import { GenobiError } from "../errors";
import type { SingleFileOperation } from "../types/operation";
import { fileSys } from "./file-sys";
import { logger } from "./logger";

/**
 * Gets the content for a single file operation, either from a template string or template file.
 *
 * @param {SingleFileOperation} operation - The operation configuration
 * @param {Record<string, any>} data - The data for template processing
 * @returns {Promise<string>} The content as a string
 * @throws {GenobiError} If neither templateStr nor templateFilePath is provided
 * @throws {ReadError} If reading the template file fails
 */
export async function getSingleFileContent(operation: SingleFileOperation, data: Record<string, any>): Promise<string> {
	let content: string;

	if (operation.templateFilePath) {
		const templatePath = fileSys.getTemplateProcessedPath(operation.templateFilePath, data, store.state().configPath);
		content = await fileSys.readFromFile(templatePath);
	} else if (operation.templateStr) {
		content = operation.templateStr;
	} else {
		logger.error("No template string or template file value found.");
		throw new GenobiError("NO_TEMPLATE_FOUND", "Either templateFile(s) or templateStr must be provided");
	}

	return content;
}

/**
 * Utilities for working with content for file operations.
 */
const content = {
	getSingleFileContent,
};
export { content };
