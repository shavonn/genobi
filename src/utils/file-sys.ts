import fs from "node:fs/promises";
import path from "node:path";
import { store } from "../config-store";
import { MakeDirError, ReadError, WriteError } from "../errors";
import { templates } from "./templates";

/**
 * Processes a template path and resolves it relative to a root directory.
 *
 * @param {string} templatePath - The template path with optional Handlebars expressions
 * @param {Record<string, any>} data - The data for template processing
 * @param {string} rootPath - The root directory to resolve relative paths from
 * @returns {string} The processed and resolved absolute path
 */
function getTemplateProcessedPath(templatePath: string, data: Record<string, any>, rootPath: string): string {
	const processed = templates.process(templatePath, data);
	return path.resolve(rootPath, processed);
}

/**
 * Checks if a file exists at the given path.
 *
 * @param {string} filePath - The path to check
 * @returns {Promise<boolean>} True if the file exists, false otherwise
 */
async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(path.resolve(store.state().destinationBasePath, filePath));
		return true;
	} catch {
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
	try {
		await fs.mkdir(resolvedPath, { recursive: true });
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
			throw new MakeDirError(resolvedPath);
		}
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
	try {
		await fs.writeFile(filePath, content);
	} catch (err) {
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
	let content: string;
	try {
		content = await fs.readFile(filePath, "utf8");
		return content;
	} catch (err) {
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
