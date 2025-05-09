import path from "node:path";
import { store } from "../../config-store";
import { UnknownOperationType } from "../../errors";
import type { AmendOperation } from "../../types/operation";
import { common } from "../../utils/common";
import { content } from "../../utils/content";
import { fileSys } from "../../utils/file-sys";
import { stringHelpers } from "../../utils/helpers/string-transformers";
import { logger } from "../../utils/logger";
import { templateProcessor } from "../../utils/template-processor";

const combiners = {
	append: {
		process: (existingContent: string, newContent: string, pattern?: string | RegExp, separator = "\n") => {
			if (pattern) {
				const regex = pattern instanceof RegExp ? pattern : new RegExp(common.escapeRegExp(pattern as string));
				const match = existingContent.match(regex);
				if (match && match.index !== undefined) {
					const matchEnd = match.index + match[0].length;
					return existingContent.substring(0, matchEnd) + separator + newContent + existingContent.substring(matchEnd);
				}
				logger.warn("Pattern not found, appending to end instead.");
			}
			return existingContent + separator + newContent;
		},
	},

	prepend: {
		process: (existingContent: string, newContent: string, pattern?: string | RegExp, separator = "\n") => {
			if (pattern) {
				const regex = pattern instanceof RegExp ? pattern : new RegExp(common.escapeRegExp(pattern as string));
				const match = existingContent.match(regex);
				if (match && match.index !== undefined) {
					return (
						existingContent.substring(0, match.index) + newContent + separator + existingContent.substring(match.index)
					);
				}
				logger.warn("Pattern not found, prepending to beginning instead.");
			}
			return newContent + separator + existingContent;
		},
	},
};

async function amendFile(operation: AmendOperation, data: Record<string, any>): Promise<void> {
	const combiner = combiners[operation.type];
	if (!combiner) {
		throw new UnknownOperationType(operation.type);
	}

	const filePath = fileSys.getTemplateProcessedPath(operation.filePath, data, store.state().destinationBasePath);

	await fileSys.ensureDirectoryExists(path.dirname(filePath));

	let existingContent = "";
	const exists = await fileSys.fileExists(filePath);
	if (exists) {
		existingContent = await fileSys.readFromFile(filePath);
	}

	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templateProcessor.process(content, data);
	});

	if (operation.unique && existingContent.includes(processedContent)) {
		logger.warn(`Content already exists in ${filePath}, skipping ${operation.type}.`);
		return;
	}

	const separator = operation.separator || "\n";
	let newContent: string;

	// Handle empty file case
	if (!existingContent) {
		newContent = processedContent;
		logger.warn(`${stringHelpers.sentenceCase(operation.type)} file not found: ${filePath}.`);
		logger.warn("The file will be created.");
	} else {
		// Process with or without pattern
		newContent = combiner.process(existingContent, processedContent, operation.pattern, separator);
	}

	await fileSys.writeToFile(filePath, newContent);
	logger.success(`File ${stringHelpers.sentenceCase(operation.type)}ed: ${filePath}.`);
}

const append = (operation: AmendOperation, data: Record<string, any>) =>
	amendFile({ ...operation, type: "append" }, data);

const prepend = (operation: AmendOperation, data: Record<string, any>) =>
	amendFile({ ...operation, type: "prepend" }, data);

export { amendFile, append, prepend, combiners };
