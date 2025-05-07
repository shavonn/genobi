import fs from "node:fs/promises";
import { operationDecorators } from "../../src/core/operations/operation-decorators";
import { content } from "../../src/utils/content";
import { helperRegister } from "../../src/utils/helpers/helper-register";
import { logger } from "../../src/utils/logger";
import { pathDir } from "../../src/utils/path-dir";
import { testData } from "../__fixtures__/test-data";
import { testFiles } from "../__fixtures__/test-files";
import { getTmpDirPath, loadTestFiles } from "../test-utils";

describe("content utils", () => {
	describe("getSingleFileContent", () => {
		const input = { name: "button" };

		beforeAll(() => {
			helperRegister.register();
		});

		beforeEach(async () => {
			vi.spyOn(pathDir, "getTemplateProcessedPath");
		});

		it("should return template content from templateStr", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "prepend",
				}),
			);

			const result = await content.getSingleFileContent(operation, input);

			expect(result).toBe(testFiles.aggregateCss.templateStr);
			expect(pathDir.getTemplateProcessedPath).not.toHaveBeenCalled();
		});

		it("should return template content from templateFile", async () => {
			const operation = operationDecorators.create(testData.makeCreateOperation());
			const mergedData = {
				...input,
				...testData.themeData,
			};

			await loadTestFiles({
				"templates/component.tsx.hbs": testFiles.component.templateFileContent,
			});

			vi.spyOn(fs, "readFile");

			const result = await content.getSingleFileContent(operation, mergedData);

			expect(pathDir.getTemplateProcessedPath).toHaveBeenCalledWith(operation.templateFilePath, mergedData);
			expect(result).toBe(testFiles.component.templateFileContent);
			expect(fs.readFile).toHaveBeenCalledWith(getTmpDirPath(operation.templateFilePath), "utf8");
		});

		it("should throw error when no templateStr or templateFile found for single file operation", async () => {
			const operation = {
				type: "prepend",
				filePath: "src/css/file.css",
			};

			await expect(content.getSingleFileContent(operation, input)).rejects.toThrow();

			expect(logger.error).toBeCalledWith(expect.stringContaining("No template string or file found"));
			expect(pathDir.getTemplateProcessedPath).not.toHaveBeenCalled();
		});

		it("should throw error when error encountered reading file", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "prepend",
					templateStr: undefined,
					templateFilePath: "templates/style.css.hbs",
				}),
			);

			vi.spyOn(fs, "readFile").mockRejectedValueOnce(new Error());

			await expect(content.getSingleFileContent(operation, input)).rejects.toThrow();

			expect(pathDir.getTemplateProcessedPath).toHaveBeenCalledWith(operation.templateFilePath, input);
			expect(fs.readFile).toHaveBeenCalledWith(getTmpDirPath(operation.templateFilePath), "utf8");
			expect(logger.error).toBeCalledWith(expect.stringContaining("Error reading template file"));
		});
	});
});
