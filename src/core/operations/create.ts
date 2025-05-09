import path from "node:path";
import { store } from "../../config-store";
import { FileExistsError } from "../../errors";
import type { CreateOperation } from "../../types/operation";
import { content } from "../../utils/content";
import { fileSys } from "../../utils/file-sys";
import { logger } from "../../utils/logger";
import { templates } from "../../utils/templates";

async function create(operation: CreateOperation, data: Record<string, any>): Promise<void> {
	const filePath = fileSys.getTemplateProcessedPath(operation.filePath, data, store.state().destinationBasePath);

	await fileSys.ensureDirectoryExists(path.dirname(filePath));

	const exists = await fileSys.fileExists(filePath);
	if (exists) {
		if (operation.overwrite) {
			logger.warn(`File already exists: ${filePath}.`);
			logger.warn("It will be overwritten.");
		} else if (operation.skipIfExists) {
			logger.warn(`File already exists: ${filePath}.`);
			logger.warn("This operation will be skipped.");
			return;
		} else {
			throw new FileExistsError(filePath);
		}
	}

	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templates.process(content, data);
	});

	await fileSys.writeToFile(filePath, processedContent);
	logger.success(`File created: ${filePath}.`);
}

export { create };
