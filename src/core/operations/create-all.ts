import path from "node:path";
import { glob } from "glob";
import { store } from "../../config-store";
import { FileExistsError, GenobiError } from "../../errors";
import type { CreateAllOperation } from "../../types/operation";
import { common } from "../../utils/common";
import { fileSys } from "../../utils/file-sys";
import { logger } from "../../utils/logger";
import { templates } from "../../utils/templates";

/**
 * Executes a createAll operation to generate multiple files from a glob pattern.
 *
 * This function will:
 * 1. Process the destination path with template data
 * 2. Find all template files matching the glob pattern
 * 3. Process each template file and create the corresponding output file
 * 4. Handle existing files according to the skipIfExists/overwrite settings
 *
 * Uses atomic file operations to prevent TOCTOU race conditions when checking
 * for file existence.
 *
 * @param {CreateAllOperation} operation - The createAll operation configuration
 * @param {Record<string, unknown>} data - The data for template processing
 * @returns {Promise<void>}
 * @throws {GenobiError} If no template files match the glob pattern
 * @throws {FileExistsError} If a file already exists and neither skipIfExists nor overwrite is true
 */
async function createAll(operation: CreateAllOperation, data: Record<string, unknown>): Promise<void> {
	// Process the destination path with template data
	const destinationPath = fileSys.getTemplateProcessedPath(
		operation.destinationPath,
		data,
		store.state().destinationBasePath,
	);
	logger.info(`Creating multiple files in: ${destinationPath}`);
	logger.debug(`Absolute destination path: ${path.resolve(destinationPath)}`);

	// Process the glob pattern with template data
	let templateGlob = templates.process(operation.templateFilesGlob, data);
	logger.info(`Using template pattern: ${templateGlob}`);

	// Determine the base path for templates
	const templateBasePath = operation.templateBasePath
		? path.resolve(store.state().configPath, operation.templateBasePath)
		: path.dirname(path.resolve(store.state().configPath, templateGlob));
	logger.debug(`Template base path: ${templateBasePath}`);

	// Resolve the glob pattern to an absolute path
	templateGlob = path.resolve(store.state().configPath, templateGlob);
	logger.debug(`Resolved glob pattern: ${templateGlob}`);

	// Find all template files matching the glob
	logger.info("Searching for template files...");
	const templatePaths = glob.globSync(templateGlob);
	logger.info(`Found ${templatePaths.length} template files`);
	logger.debug(`Template files: ${JSON.stringify(templatePaths, null, 2)}`);

	// Verify that at least one template was found
	if (templatePaths.length === 0) {
		throw new GenobiError("NO_GLOB_MATCHES", `No template files found matching: ${templateGlob}`);
	}

	// Ensure the destination directory exists
	logger.info("Creating destination directory");
	await fileSys.ensureDirectoryExists(destinationPath);

	// Process each template file
	for (const templatePath of templatePaths) {
		try {
			logger.info(`Processing template: ${path.basename(templatePath)}`);
			logger.debug(`Full template path: ${templatePath}`);

			// Read the template file
			const content = await fileSys.readFromFile(templatePath);
			logger.debug(`Template content length: ${content.length} characters`);

			// Calculate the relative path for the output file
			let relativePath = path.relative(templateBasePath, templatePath);
			logger.debug(`Relative path: ${relativePath}`);

			// Remove .hbs extension if present
			if (relativePath.endsWith(".hbs")) {
				relativePath = relativePath.slice(0, -4);
				logger.debug(`Removed .hbs extension: ${relativePath}`);
			}

			// Generate the final output file path
			const filePath = fileSys.getTemplateProcessedPath(relativePath, data, destinationPath);
			logger.info(`Creating file: ${filePath}`);

			// For skipIfExists, check first since we want to skip gracefully
			if (operation.skipIfExists) {
				const exists = await fileSys.fileExists(filePath);
				if (exists) {
					logger.warn(`File already exists: ${filePath}`);
					logger.warn("This file will be skipped.");
					logger.debug("Skipping due to skipIfExists=true");
					continue;
				}
			}

			// Ensure the directory for the output file exists
			const outputDir = path.dirname(filePath);
			logger.debug(`Ensuring output directory exists: ${outputDir}`);
			await fileSys.ensureDirectoryExists(outputDir);

			// Process the template content with data
			logger.info("Processing template content");
			const processedContent = templates.process(content, data);
			logger.debug(`Processed content length: ${processedContent.length} characters`);

			// Write the processed content to the output file
			// - If overwrite is true, use normal write (will overwrite existing files)
			// - Otherwise, use exclusive write to atomically fail if file exists
			logger.info("Writing to file");

			if (operation.overwrite) {
				logger.debug("Using overwrite mode");
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

			logger.success(`Created file: ${filePath}`);
		} catch (err) {
			// If haltOnError is true, rethrow the error
			if (operation.haltOnError) {
				throw err;
			}
			// Otherwise, log the error and continue
			logger.error(common.getErrorMessage(err));
			logger.debug(`Error stack: ${common.isErrorWithStack(err) ? err.stack : "No stack trace available"}`);
		}
	}

	logger.success(`CreateAll operation completed: ${templatePaths.length} files processed`);
}

export { createAll };
