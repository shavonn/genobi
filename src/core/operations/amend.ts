import path from "node:path";
import { store } from "../../config-store";
import { UnknownOperationType } from "../../errors";
import type { AmendOperation } from "../../types/operation";
import { common } from "../../utils/common";
import { content } from "../../utils/content";
import { fileSys } from "../../utils/file-sys";
import { stringHelpers } from "../../utils/helpers/string-transformers";
import { logger } from "../../utils/logger";
import { templates } from "../../utils/templates";

/**
 * Strategies for combining existing content with new content.
 * These are used by append and prepend operations.
 */
const combiners = {
	/**
	 * Strategy for append operations - adds content after existing content.
	 */
	append: {
		/**
		 * Processes content for append operations with a specific position.
		 *
		 * @param {string} existingContent - The current file content
		 * @param {string} newContent - The content to append
		 * @param {number} placementIdx - The position to append at
		 * @param {string} [separator="\n"] - Separator between existing and new content
		 * @returns {string} The combined content
		 */
		process: (existingContent: string, newContent: string, placementIdx: number, separator: string): string => {
			logger.info(`Append: Inserting at position ${placementIdx} with separator "${separator}"`);
			return (
				existingContent.substring(0, placementIdx) + separator + newContent + existingContent.substring(placementIdx)
			);
		},

		/**
		 * Default action for append operations - adds content at the end.
		 *
		 * @param {string} existingContent - The current file content
		 * @param {string} newContent - The content to append
		 * @param {string} [separator="\n"] - Separator between existing and new content
		 * @returns {string} The combined content
		 */
		defaultAction: (existingContent: string, newContent: string, separator: string): string => {
			logger.info(`Append: Adding content to end with separator "${separator}"`);
			return existingContent + separator + newContent;
		},

		/**
		 * Message to display when pattern is not found.
		 */
		patternNotFoundMessage: "appending to end instead",
	},

	/**
	 * Strategy for prepend operations - adds content before existing content.
	 */
	prepend: {
		/**
		 * Processes content for prepend operations with a specific position.
		 *
		 * @param {string} existingContent - The current file content
		 * @param {string} newContent - The content to prepend
		 * @param {number} placementIdx - The position to prepend at
		 * @param {string} [separator="\n"] - Separator between new and existing content
		 * @returns {string} The combined content
		 */
		process: (existingContent: string, newContent: string, placementIdx: number, separator: string): string => {
			logger.info(`Prepend: Inserting at position ${placementIdx} with separator "${separator}"`);
			return (
				existingContent.substring(0, placementIdx) + newContent + separator + existingContent.substring(placementIdx)
			);
		},

		/**
		 * Default action for prepend operations - adds content at the beginning.
		 *
		 * @param {string} existingContent - The current file content
		 * @param {string} newContent - The content to prepend
		 * @param {string} [separator="\n"] - Separator between new and existing content
		 * @returns {string} The combined content
		 */
		defaultAction: (existingContent: string, newContent: string, separator: string): string => {
			logger.info(`Prepend: Adding content to beginning with separator "${separator}"`);
			return newContent + separator + existingContent;
		},

		/**
		 * Message to display when pattern is not found.
		 */
		patternNotFoundMessage: "prepending to beginning instead",
	},
};

/**
 * Executes an amend operation (append or prepend) to modify an existing file.
 *
 * This function will:
 * 1. Process the file path with Handlebars templates
 * 2. Ensure the directory exists
 * 3. Get the existing file content if the file exists
 * 4. Process the template content
 * 5. Check if the content already exists (if unique is true)
 * 6. Combine the existing content with the new content
 * 7. Write the combined content to the file
 *
 * @param {AmendOperation} operation - The amend operation configuration
 * @param {Record<string, any>} data - The data for template processing
 * @returns {Promise<void>}
 * @throws {UnknownOperationType} If the operation type is not "append" or "prepend"
 * @throws {ReadError} If reading the file fails
 * @throws {WriteError} If writing the file fails
 */
async function amendFile(operation: AmendOperation, data: Record<string, any>): Promise<void> {
	// Get the appropriate combiner strategy based on operation type
	const combiner = combiners[operation.type];
	if (!combiner) {
		throw new UnknownOperationType(operation.type);
	}

	// Process the file path with template data
	const filePath = fileSys.getTemplateProcessedPath(operation.filePath, data, store.state().destinationBasePath);
	logger.info(`${stringHelpers.titleCase(operation.type)} operation on file: ${filePath}`);
	logger.info(`Absolute path: ${path.resolve(filePath)}`);

	// Ensure the directory exists
	const dirPath = path.dirname(filePath);
	logger.info(`Ensuring directory exists: ${dirPath}`);
	await fileSys.ensureDirectoryExists(path.dirname(filePath));

	// Get the existing file content
	let existingContent = "";
	const exists = await fileSys.fileExists(filePath);
	if (exists) {
		logger.info("File exists, reading current content");
		existingContent = await fileSys.readFromFile(filePath);
		logger.info(`Read existing content, length: ${existingContent.length} characters`);
	}

	// Process the template content
	logger.info(`Processing template content for ${operation.type} operation`);
	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templates.process(content, data);
	});
	logger.info(`Template processed, content length: ${processedContent.length} characters`);

	// Check if the content already exists (if unique is true)
	if (operation.unique && existingContent.includes(processedContent)) {
		logger.warn(`Content already exists in ${filePath}, skipping ${operation.type}.`);
		logger.info("Skipping due to unique=true and content already exists");
		return;
	}

	// Get the separator to use
	const separator = operation.separator || "\n";
	logger.info(`Using separator: "${separator}"`);

	let newContent = "";

	// Handle case where file doesn't exist yet
	if (!existingContent) {
		newContent = processedContent;
		logger.warn(`${stringHelpers.sentenceCase(operation.type)} file not found: ${filePath}.`);
		logger.warn("The file will be created.");
		logger.info(`Creating new file with content length: ${processedContent.length} characters`);
	} else {
		// Handle pattern matching
		if (operation.pattern) {
			logger.info("Searching for pattern in file");
			logger.debug(`Pattern: ${operation.pattern}`);

			const regex =
				operation.pattern instanceof RegExp
					? operation.pattern
					: new RegExp(common.escapeRegExp(operation.pattern as string));

			logger.debug(`Using regex pattern: ${regex}`);

			const match = existingContent.match(regex);
			if (match && match.index !== undefined) {
				logger.info("Pattern found, modifying at match location");
				logger.debug(`Pattern found at position ${match.index}, match: "${match[0]}"`);
				newContent = combiner.process(
					existingContent,
					processedContent,
					operation.type === "append" ? match.index + match[0].length : match.index,
					separator,
				);
			} else {
				logger.warn(`Pattern not found in ${filePath}, ${combiner.patternNotFoundMessage}`);
				logger.debug(`Falling back to default ${operation.type} behavior`);
			}
		}

		// If pattern not found or not specified, use default action
		if (!newContent) {
			logger.info(`Using default ${operation.type} behavior`);
			newContent = combiner.defaultAction(existingContent, processedContent, separator);
		}
	}

	logger.debug(`Final content prepared, length: ${newContent.length} characters`);
	logger.info("Writing modified content to file");

	// Write the combined content to the file
	await fileSys.writeToFile(filePath, newContent);
	logger.success(`File ${stringHelpers.lowerCase(operation.type)}ed: ${filePath}`);
}

/**
 * Executes an append operation to add content to the end of a file.
 *
 * @param {AmendOperation} operation - The operation configuration
 * @param {Record<string, any>} data - The data for template processing
 * @returns {Promise<void>}
 */
const append = (operation: AmendOperation, data: Record<string, any>): Promise<void> => {
	logger.info("Starting append operation");
	return amendFile({ ...operation, type: "append" }, data);
};

/**
 * Executes a prepend operation to add content to the beginning of a file.
 *
 * @param {AmendOperation} operation - The operation configuration
 * @param {Record<string, any>} data - The data for template processing
 * @returns {Promise<void>}
 */
const prepend = (operation: AmendOperation, data: Record<string, any>): Promise<void> => {
	logger.info("Starting prepend operation");
	return amendFile({ ...operation, type: "prepend" }, data);
};

export { amendFile, append, prepend, combiners };
