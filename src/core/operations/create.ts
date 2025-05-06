import fs from "node:fs/promises";
import path from "node:path";
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
			logger.warn(`File already exists: ${filePath}. Overwriting.`);
		} else if (operation.skipIfExists) {
			logger.warn(`File already exists: ${filePath}. Skipping.`);
			return;
		} else {
			throw new Error(`File already exists: ${filePath}`);
		}
	}

	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templateProcessor.process(content, data);
	});

	try {
		await fs.writeFile(filePath, processedContent);
		logger.success(`Created file: ${filePath}`);
	} catch (error) {
		logger.error(`Error writing file: ${filePath}`);
		throw error;
	}
}

export { create };
