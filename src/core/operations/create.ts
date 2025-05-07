import fs from "node:fs/promises";
import path from "node:path";
import { OperationFileExistsError, OperationWriteError } from "../../errors";
import type { CreateOperation } from "../../types/operation";
import { content } from "../../utils/content";
import { logger } from "../../utils/logger";
import { pathDir } from "../../utils/path-dir";
import { templateProcessor } from "../../utils/template-processor";

async function create(operation: CreateOperation, data: Record<string, any>): Promise<void> {
	const filePath = pathDir.getTemplateProcessedPath(operation.filePath, data);

	await pathDir.ensureDirectoryExists(path.dirname(filePath));

	const exists = await pathDir.fileExists(filePath);
	if (exists) {
		if (operation.overwrite) {
			logger.warn(`Create file already exists: ${filePath}.`);
			logger.warn("This file will be overwritten.");
		} else if (operation.skipIfExists) {
			logger.warn(`Create file already exists: ${filePath}`);
			logger.warn("This operation will be skipped.");
			return;
		} else {
			throw new OperationFileExistsError(filePath);
		}
	}

	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templateProcessor.process(content, data);
	});

	try {
		await fs.writeFile(filePath, processedContent);
		logger.success(`File created: ${filePath}.`);
	} catch (error) {
		throw new OperationWriteError(filePath, error);
	}
}

export { create };
