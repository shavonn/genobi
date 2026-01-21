// src/utils/content.ts
import path from "node:path";
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

  logger.info(`Getting template content for ${operation.type} operation`);

  if (operation.templateFilePath) {
    logger.info("Reading template from file");
    logger.debug(`Template file: ${operation.templateFilePath}`);
    const templatePath = fileSys.getTemplateProcessedPath(operation.templateFilePath, data, store.state().configPath);
    logger.debug(`Resolved template path: ${templatePath}`);
    logger.debug(`Absolute template path: ${path.resolve(templatePath)}`);

    content = await fileSys.readFromFile(templatePath);
    logger.debug(`Template file content length: ${content.length} characters`);
  } else if (operation.templateStr) {
    logger.info("Using inline template string");
    logger.debug(`Template string length: ${operation.templateStr.length} characters`);
    content = operation.templateStr;
  } else {
    logger.error("No template source specified (templateStr or templateFilePath).");
    throw new GenobiError("NO_TEMPLATE_FOUND", "Either templateFile or templateStr must be provided");
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
