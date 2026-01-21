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
 * 3. Handle file existence according to skipIfExists/overwrite settings
 * 4. Get and process the file content
 * 5. Write the processed content to the file atomically
 *
 * Uses atomic file operations to prevent TOCTOU race conditions when checking
 * for file existence.
 *
 * @param {CreateOperation} operation - The create operation configuration
 * @param {Record<string, unknown>} data - The data for template processing
 * @returns {Promise<void>}
 * @throws {FileExistsError} If the file already exists and neither skipIfExists nor overwrite is true
 * @throws {WriteError} If writing the file fails
 */
async function create(operation: CreateOperation, data: Record<string, unknown>): Promise<void> {
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

	// For skipIfExists, we need to check first since we want to skip gracefully
	// This is still a TOCTOU window, but it's acceptable since we're skipping anyway
	if (operation.skipIfExists) {
		const exists = await fileSys.fileExists(filePath);
		if (exists) {
			logger.warn(`File already exists: ${filePath}`);
			logger.warn("This operation will be skipped.");
			logger.debug("Skipping due to skipIfExists=true");
			return;
		}
	}

	// Get the content from template string or file
	logger.info("Processing template");
	logger.debug(`Template source: ${operation.templateFilePath ? "file" : "string"}`);
	if (operation.templateFilePath) {
		logger.debug(`Template file path: ${operation.templateFilePath}`);
	}

	const processedContent = await content.getSingleFileContent(operation, data).then((tplContent) => {
		return templates.process(tplContent, data);
	});
	logger.debug(`Processed content length: ${processedContent.length} characters`);

	// Write the content to the file
	// - If overwrite is true, use normal write (will overwrite existing files)
	// - Otherwise, use exclusive write to atomically fail if file exists
	logger.info("Writing content to file");

	if (operation.overwrite) {
		logger.debug("Using overwrite mode");
		// Check if file exists just for logging purposes
		const exists = await fileSys.fileExists(filePath);
		if (exists) {
			logger.warn(`File already exists: ${filePath}`);
			logger.warn("It will be overwritten.");
		}
		await fileSys.writeToFile(filePath, processedContent);
	} else {
		// Use atomic exclusive write - will throw FileExistsError if file exists
		logger.debug("Using exclusive write mode for atomic create");
		await fileSys.writeToFile(filePath, processedContent, { exclusive: true });
	}

	logger.success(`File created: ${filePath}`);
}

export { create };
