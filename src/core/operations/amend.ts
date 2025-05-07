import fs from "node:fs/promises";
import path from "node:path";
import { OperationReadError, OperationWriteError } from "../../errors";
import type { AmendOperation } from "../../types/operation";
import { common } from "../../utils/common";
import { content } from "../../utils/content";
import { stringHelpers } from "../../utils/helpers/string-transformers";
import { logger } from "../../utils/logger";
import { pathDir } from "../../utils/path-dir";
import { templateProcessor } from "../../utils/template-processor";

const combiners = {
	append: {
		combine: (existingContent: string, newContent: string, pattern?: string | RegExp, separator = "\n") => {
			const regex = pattern instanceof RegExp ? pattern : new RegExp(common.escapeRegExp(pattern as string));
			const match = existingContent.match(regex);
			if (match && match.index !== undefined) {
				const matchEnd = match.index + match[0].length;
				return existingContent.substring(0, matchEnd) + separator + newContent + existingContent.substring(matchEnd);
			}
			return existingContent + separator + newContent;
		},
		defaultAction: (existingContent: string, newContent: string, separator = "\n") => {
			return existingContent + separator + newContent;
		},
		patternNotFoundMessage: "appending to end instead",
	},

	prepend: {
		combine: (existingContent: string, newContent: string, pattern?: string | RegExp, separator = "\n") => {
			const regex = pattern instanceof RegExp ? pattern : new RegExp(common.escapeRegExp(pattern as string));
			const match = existingContent.match(regex);
			if (match && match.index !== undefined) {
				return (
					existingContent.substring(0, match.index) + newContent + separator + existingContent.substring(match.index)
				);
			}
			return newContent + separator + existingContent;
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
		throw new Error(`Unknown amendment operation type: ${operation.type}.`);
	}

	const filePath = pathDir.getTemplateProcessedPath(operation.filePath, data);

	await pathDir.ensureDirectoryExists(path.dirname(filePath));

	const processedContent = await content.getSingleFileContent(operation, data).then((content) => {
		return templateProcessor.process(content, data);
	});

	let existingContent = "";
	const exists = await pathDir.fileExists(filePath);
	if (exists) {
		try {
			existingContent = await fs.readFile(filePath, "utf8");
		} catch (error) {
			throw new OperationReadError(filePath, error);
		}
	}

	if (operation.unique && existingContent.includes(processedContent)) {
		logger.warn(`Content already exists in ${filePath}, skipping operation.`);
		return;
	}

	const separator = operation.separator || "\n";

	let newContent: string;

	if (!existingContent) {
		newContent = processedContent;
		logger.warn(`File not found to ${operation.type}. Creating.`);
	} else if (operation.pattern) {
		const regex =
			operation.pattern instanceof RegExp ? operation.pattern : new RegExp(common.escapeRegExp(operation.pattern));

		const match = existingContent.match(regex);
		if (match && match.index !== undefined) {
			newContent = combiner.combine(existingContent, processedContent, operation.pattern, separator);
		} else {
			logger.warn(`Pattern not found in ${filePath}, ${combiner.patternNotFoundMessage}.`);
			newContent = combiner.defaultAction(existingContent, processedContent, separator);
		}
	} else {
		newContent = combiner.defaultAction(existingContent, processedContent, separator);
	}

	try {
		await fs.writeFile(filePath, newContent);
		logger.success(`${stringHelpers.titleCase(operation.type)}ed to file: ${filePath}.`);
	} catch (error) {
		throw new OperationWriteError(filePath, error);
	}
}

const append = (operation: AmendOperation, data: Record<string, any>) =>
	amendFile({ ...operation, type: "append" }, data);

const prepend = (operation: AmendOperation, data: Record<string, any>) =>
	amendFile({ ...operation, type: "prepend" }, data);

export { amendFile, append, prepend };
