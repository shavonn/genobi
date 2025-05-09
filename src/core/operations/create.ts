import path from "node:path";
import { store } from "../../config-store";
import { FileExistsError } from "../../errors";
import type { CreateOperation } from "../../types/operation";
import { content } from "../../utils/content";
import { fileSys } from "../../utils/file-sys";
import { logger } from "../../utils/logger";
import { templates } from "../../utils/templates";

/**
 * Executes a create operation to generate a new file.
 *
 * This function will:
 * 1. Process the file path with Handlebars templates
 * 2. Create any directories needed
 * 3. Check if the file already exists and handle according to skipIfExists/overwrite
 * 4. Get and process the file content
 * 5. Write the processed content to the file
 *
 * @param {CreateOperation} operation - The create operation configuration
 * @param {Record<string, any>} data - The data for template processing
 * @returns {Promise<void>}
 * @throws {FileExistsError} If the file already exists and neither skipIfExists nor overwrite is true
 * @throws {WriteError} If writing the file fails
 */
async function create(operation: CreateOperation, data: Record<string, any>): Promise<void> {
	// Process the file path with Handlebars
	const filePath = fileSys.getTemplateProcessedPath(operation.filePath, data, store.state().destinationBasePath);

	// Ensure the directory exists
	await fileSys.ensureDirectoryExists(path.dirname(filePath));

	// Check if file exists and handle accordingly
	const exists = await fileSys.fileExists(filePath);
	if (exists) {
		if (operation.overwrite) {
			logger.warn(`File already exists: ${filePath}.`);
			logger.warn("It will be overwritten.");
		} else if (operation.skipIfExists) {
			logger.warn(`File already exists: ${filePath}.`);
			logger.warn("This operation will be skipped.");
			return;
		} else {
			throw new FileExistsError(filePath);
		}
	}

	// Get the content from template string or file
	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templates.process(content, data);
	});

	// Write the content to the file
	await fileSys.writeToFile(filePath, processedContent);
	logger.success(`File created: ${filePath}.`);
}

export { create };
