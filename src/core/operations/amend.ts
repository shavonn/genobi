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
		process: (existingContent: string, newContent: string, placementIdx: number, separator = "\n") => {
			return (
				existingContent.substring(0, placementIdx) + separator + newContent + existingContent.substring(placementIdx)
			);
		},
		defaultAction: (existingContent: string, newContent: string, separator = "\n") => {
			return existingContent + separator + newContent;
		},
		patternNotFoundMessage: "appending to end instead",
	},

	prepend: {
		process: (existingContent: string, newContent: string, placementIdx: number, separator = "\n") => {
			return (
				existingContent.substring(0, placementIdx) + newContent + separator + existingContent.substring(placementIdx)
			);
		},
		defaultAction: (existingContent: string, newContent: string, separator = "\n") => {
			return newContent + separator + existingContent;
		},
		patternNotFoundMessage: "prepending to beginning instead",
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
	let newContent = "";

	if (!existingContent) {
		newContent = processedContent;
		logger.warn(`${stringHelpers.sentenceCase(operation.type)} file not found: ${filePath}.`);
		logger.warn("The file will be created.");
	} else {
		if (operation.pattern) {
			const regex =
				operation.pattern instanceof RegExp
					? operation.pattern
					: new RegExp(common.escapeRegExp(operation.pattern as string));

			const match = existingContent.match(regex);
			if (match && match.index !== undefined) {
				newContent = combiner.process(
					existingContent,
					processedContent,
					operation.type === "append" ? match.index + match[0].length : match.index,
					separator,
				);
			} else {
				logger.warn(`Pattern not found in ${filePath}, ${combiner.patternNotFoundMessage}.`);
			}
		}

		if (!newContent) {
			newContent = combiner.defaultAction(existingContent, processedContent, separator);
		}
	}

	await fileSys.writeToFile(filePath, newContent);
	logger.success(`File ${stringHelpers.sentenceCase(operation.type)}ed: ${filePath}.`);
}

const append = (operation: AmendOperation, data: Record<string, any>) =>
	amendFile({ ...operation, type: "append" }, data);

const prepend = (operation: AmendOperation, data: Record<string, any>) =>
	amendFile({ ...operation, type: "prepend" }, data);

export { amendFile, append, prepend, combiners };
