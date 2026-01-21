import fs from "node:fs/promises";
import path from "node:path";
import { store } from "../config-store";
import { MakeDirError, PathTraversalError, ReadError, WriteError } from "../errors";
import { logger } from "./logger";
import { templates } from "./templates";

/**
 * Validates that a resolved path stays within the specified root directory.
 * Prevents path traversal attacks where template data could escape the destination.
 *
 * @param {string} resolvedPath - The fully resolved absolute path to validate
 * @param {string} rootPath - The root directory that should contain the path
 * @throws {PathTraversalError} If the resolved path escapes the root directory
 */
function validatePathWithinRoot(resolvedPath: string, rootPath: string): void {
	const normalizedRoot = path.resolve(rootPath);
	const normalizedTarget = path.resolve(resolvedPath);

	// Check if the target path starts with the root path
	// We need to ensure it's either the root itself or a proper subdirectory
	const isWithinRoot = normalizedTarget === normalizedRoot || normalizedTarget.startsWith(normalizedRoot + path.sep);

	if (!isWithinRoot) {
		logger.error(`Path traversal attempt detected: "${resolvedPath}" escapes "${rootPath}"`);
		throw new PathTraversalError(resolvedPath, rootPath);
	}
}

/**
 * Processes a template path and resolves it relative to a root directory.
 * Validates that the resulting path stays within the root directory to prevent path traversal.
 *
 * @param {string} templatePath - The template path with optional Handlebars expressions
 * @param {Record<string, any>} data - The data for template processing
 * @param {string} rootPath - The root directory to resolve relative paths from
 * @returns {string} The processed and resolved absolute path
 * @throws {PathTraversalError} If the resolved path escapes the root directory
 */
function getTemplateProcessedPath(templatePath: string, data: Record<string, any>, rootPath: string): string {
	logger.debug(`Processing template path: ${templatePath}`);
	const processed = templates.process(templatePath, data);
	logger.debug(`Path after template processing: ${processed}`);

	const resolvedPath = path.resolve(rootPath, processed);
	logger.debug(`Resolved absolute path: ${resolvedPath}`);

	// Validate that the resolved path doesn't escape the root directory
	validatePathWithinRoot(resolvedPath, rootPath);

	return resolvedPath;
}

/**
 * Checks if a file exists at the given path.
 *
 * @param {string} filePath - The path to check
 * @returns {Promise<boolean>} True if the file exists, false otherwise
 */
async function fileExists(filePath: string): Promise<boolean> {
	const resolvedPath = path.resolve(store.state().destinationBasePath, filePath);
	logger.debug(`Checking if file exists: ${resolvedPath}`);

	try {
		await fs.access(resolvedPath);
		logger.debug(`File exists: ${resolvedPath}`);
		return true;
	} catch {
		logger.debug(`File does not exist: ${resolvedPath}`);
		return false;
	}
}

/**
 * Ensures that a directory exists, creating it and any parent directories if necessary.
 *
 * @param {string} dirPath - The directory path to create
 * @returns {Promise<void>}
 * @throws {MakeDirError} If directory creation fails
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
	const resolvedPath = path.resolve(store.state().destinationBasePath, dirPath);
	logger.debug(`Ensuring directory exists: ${resolvedPath}`);

	try {
		await fs.mkdir(resolvedPath, { recursive: true });
		logger.debug(`Directory created or already exists: ${resolvedPath}`);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
			logger.error(`Error creating directory: ${resolvedPath}`);
			logger.debug(`Error details: ${(err as Error).stack || JSON.stringify(err)}`);
			throw new MakeDirError(resolvedPath);
		}
		logger.debug(`Directory already exists (EEXIST): ${resolvedPath}`);
	}
}

/**
 * Writes content to a file.
 *
 * @param {string} filePath - The path of the file to write
 * @param {string} content - The content to write
 * @returns {Promise<void>}
 * @throws {WriteError} If writing the file fails
 */
async function writeToFile(filePath: string, content: string): Promise<void> {
	logger.debug(`Writing to file: ${filePath}`);
	logger.debug(`Content length: ${content.length} characters`);

	try {
		await fs.writeFile(filePath, content);
		logger.debug(`Successfully wrote file: ${filePath}`);
	} catch (err) {
		logger.error(`Error writing file: ${filePath}`);
		logger.debug(`Error details: ${(err as Error).stack || JSON.stringify(err)}`);
		throw new WriteError(filePath, err);
	}
}

/**
 * Reads content from a file.
 *
 * @param {string} filePath - The path of the file to read
 * @returns {Promise<string>} The file content as a string
 * @throws {ReadError} If reading the file fails
 */
async function readFromFile(filePath: string): Promise<string> {
	logger.debug(`Reading from file: ${filePath}`);

	let content: string;
	try {
		content = await fs.readFile(filePath, "utf8");
		logger.debug(`Successfully read file: ${filePath}`);
		logger.debug(`Content length: ${content.length} characters`);
		return content;
	} catch (err) {
		logger.error(`Error reading file: ${filePath}`);
		logger.debug(`Error details: ${(err as Error).stack || JSON.stringify(err)}`);
		throw new ReadError(filePath, err);
	}
}

/**
 * Utilities for working with the file system.
 */
const fileSys = {
	ensureDirectoryExists,
	fileExists,
	getTemplateProcessedPath,
	writeToFile,
	readFromFile,
};
export { fileSys };
