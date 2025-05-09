import path from "node:path";
import { glob } from "glob";
import { store } from "../../config-store";
import { FileExistsError, GenobiError } from "../../errors";
import type { CreateAllOperation } from "../../types/operation";
import { fileSys } from "../../utils/file-sys";
import { logger } from "../../utils/logger";
import { templates } from "../../utils/templates";

async function createAll(operation: CreateAllOperation, data: Record<string, any>): Promise<void> {
	const destinationPath = fileSys.getTemplateProcessedPath(
		operation.destinationPath,
		data,
		store.state().destinationBasePath,
	);

	let templateGlob = templates.process(operation.templateFilesGlob, data);

	const templateBasePath = operation.templateBasePath
		? path.resolve(store.state().configPath, operation.templateBasePath)
		: path.dirname(path.resolve(store.state().configPath, templateGlob));

	templateGlob = path.resolve(store.state().configPath, templateGlob);
	const templatePaths = glob.globSync(templateGlob);

	if (templatePaths.length === 0) {
		throw new GenobiError("NO_GLOB_MATCHES", `No template files found matching: ${templateGlob}`);
	}

	await fileSys.ensureDirectoryExists(destinationPath);

	for (const templatePath of templatePaths) {
		try {
			const content = await fileSys.readFromFile(templatePath);

			let relativePath = path.relative(templateBasePath, templatePath);
			if (relativePath.endsWith(".hbs")) {
				relativePath = relativePath.slice(0, -4);
			}

			const filePath = fileSys.getTemplateProcessedPath(relativePath, data, destinationPath);

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

			await fileSys.ensureDirectoryExists(path.dirname(filePath));

			const processedContent = templates.process(content, data);

			await fileSys.writeToFile(filePath, processedContent);
		} catch (err: any) {
			if (operation.haltOnError) {
				throw err;
			}
			logger.error(err.message);
		}
	}
}

export { createAll };
