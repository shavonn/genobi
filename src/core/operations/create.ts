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
	logger.info(`Creating file: ${filePath}`);
	logger.debug(`Absolute path: ${path.resolve(filePath)}`);
	logger.debug(`Operation data: ${JSON.stringify(operation.data || {}, null, 2)}`);

	// Ensure the directory exists
	const dirPath = path.dirname(filePath);
	logger.info("Ensuring directory exists");
	logger.debug(`Directory path: ${dirPath}`);
	await fileSys.ensureDirectoryExists(dirPath);

	// Check if file exists and handle accordingly
	const exists = await fileSys.fileExists(filePath);
	if (exists) {
		if (operation.overwrite) {
			logger.warn(`File already exists: ${filePath}`);
			logger.warn("It will be overwritten.");
			logger.debug("Overwriting due to overwrite=true");
		} else if (operation.skipIfExists) {
			logger.warn(`File already exists: ${filePath}`);
			logger.warn("This operation will be skipped.");
			logger.debug("Skipping due to skipIfExists=true");
			return;
		} else {
			throw new FileExistsError(filePath);
		}
	}

	// Get the content from template string or file
	logger.info("Processing template");
	logger.debug(`Template source: ${operation.templateFilePath ? "file" : "string"}`);
	if (operation.templateFilePath) {
		logger.debug(`Template file path: ${operation.templateFilePath}`);
	}

	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templates.process(content, data);
	});
	logger.debug(`Processed content length: ${processedContent.length} characters`);

	// Write the content to the file
	logger.info("Writing content to file");
	await fileSys.writeToFile(filePath, processedContent);
	logger.success(`File created: ${filePath}`);
}

export { create };
