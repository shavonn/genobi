import fs from "node:fs/promises";
import type { PrependOperation } from "../../src";
import { content } from "../../src/utils/content";
import { helperRegister } from "../../src/utils/helpers/helper-register";
import { logger } from "../../src/utils/logger";
import { pathDir } from "../../src/utils/path-dir";
import { testData } from "../__fixtures__/test-data";
import { testFiles } from "../__fixtures__/test-files";
import { getTmpDirPath } from "../test-utils";

describe("content utils", () => {
	describe("getSingleFileContent", () => {
		const input = { name: "button" };

		helperRegister.register();

		beforeEach(async () => {
			vi.spyOn(pathDir, "getTemplateProcessedPath");
		});

		it("should return template content", async () => {
			const operation = testData.makeAmendOperation({
				type: "prepend",
			}) as PrependOperation;

			const result = await content.getSingleFileContent(operation, input);

			expect(result).toBe(testFiles.css.templateStr);
			expect(pathDir.getTemplateProcessedPath).not.toHaveBeenCalled();
		});

		it("should throw error when no templateStr or templateFile found for single file operation", async () => {
			const operation = {
				type: "prepend" as const,
				filePath: "src/css/file.css",
			};

			await expect(content.getSingleFileContent(operation, input)).rejects.toThrow();

			expect(logger.error).toBeCalledWith(expect.stringContaining("No template string or file found"));
			expect(pathDir.getTemplateProcessedPath).not.toHaveBeenCalled();
		});

		it("should throw error when error encountered reading file", async () => {
			const operation = testData.makeAmendOperation({
				type: "prepend" as const,
				templateStr: undefined,
				templateFilePath: "templates/style.css.hbs",
			}) as PrependOperation;
			vi.spyOn(fs, "readFile").mockRejectedValue(new Error());

			await expect(content.getSingleFileContent(operation, input)).rejects.toThrow();

			expect(pathDir.getTemplateProcessedPath).toHaveBeenCalledWith(operation.templateFilePath, input);
			expect(fs.readFile).toHaveBeenCalledWith(getTmpDirPath(operation.templateFilePath), "utf8");
			expect(logger.error).toBeCalledWith(expect.stringContaining("Error reading template file"));
		});
	});
});
