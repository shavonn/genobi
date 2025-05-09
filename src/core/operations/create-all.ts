import path from "node:path";
import { glob } from "glob";
import { store } from "../../config-store";
import { FileExistsError, GenobiError } from "../../errors";
import type { CreateAllOperation } from "../../types/operation";
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
 * @param {CreateAllOperation} operation - The createAll operation configuration
 * @param {Record<string, any>} data - The data for template processing
 * @returns {Promise<void>}
 * @throws {GenobiError} If no template files match the glob pattern
 * @throws {FileExistsError} If a file already exists and neither skipIfExists nor overwrite is true
 */
async function createAll(operation: CreateAllOperation, data: Record<string, any>): Promise<void> {
	// Process the destination path with template data
	const destinationPath = fileSys.getTemplateProcessedPath(
		operation.destinationPath,
		data,
		store.state().destinationBasePath,
	);

	// Process the glob pattern with template data
	let templateGlob = templates.process(operation.templateFilesGlob, data);

	// Determine the base path for templates
	const templateBasePath = operation.templateBasePath
		? path.resolve(store.state().configPath, operation.templateBasePath)
		: path.dirname(path.resolve(store.state().configPath, templateGlob));

	// Resolve the glob pattern to an absolute path
	templateGlob = path.resolve(store.state().configPath, templateGlob);

	// Find all template files matching the glob
	const templatePaths = glob.globSync(templateGlob);

	// Verify that at least one template was found
	if (templatePaths.length === 0) {
		throw new GenobiError("NO_GLOB_MATCHES", `No template files found matching: ${templateGlob}`);
	}

	// Ensure the destination directory exists
	await fileSys.ensureDirectoryExists(destinationPath);

	// Process each template file
	for (const templatePath of templatePaths) {
		try {
			// Read the template file
			const content = await fileSys.readFromFile(templatePath);

			// Calculate the relative path for the output file
			let relativePath = path.relative(templateBasePath, templatePath);

			// Remove .hbs extension if present
			if (relativePath.endsWith(".hbs")) {
				relativePath = relativePath.slice(0, -4);
			}

			// Generate the final output file path
			const filePath = fileSys.getTemplateProcessedPath(relativePath, data, destinationPath);

			// Check if the file already exists and handle accordingly
			const exists = await fileSys.fileExists(filePath);
			if (exists) {
				if (operation.overwrite) {
					logger.warn(`File already exists: ${filePath}.`);
					logger.warn("It will be overwritten.");
				} else if (operation.skipIfExists) {
					logger.warn(`File already exists: ${filePath}.`);
					logger.warn("This file will be skipped.");
					continue;
				} else {
					throw new FileExistsError(filePath);
				}
			}

			// Ensure the directory for the output file exists
			await fileSys.ensureDirectoryExists(path.dirname(filePath));

			// Process the template content with data
			const processedContent = templates.process(content, data);

			// Write the processed content to the output file
			await fileSys.writeToFile(filePath, processedContent);
		} catch (err: any) {
			// If haltOnError is true, rethrow the error
			if (operation.haltOnError) {
				throw err;
			}
			// Otherwise, log the error and continue
			logger.error(err.message);
		}
	}
}

export { createAll };
