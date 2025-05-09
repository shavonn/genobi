import fs from "node:fs/promises";
import { store } from "../../src/config-store";
import { operationDecorator } from "../../src/core/operations/operation-decorator";
import { content } from "../../src/utils/content";
import { fileSys } from "../../src/utils/file-sys";
import { logger } from "../../src/utils/logger";
import { templateAssetRegister } from "../../src/utils/template-asset-register";
import { testData } from "../__fixtures__/test-data";
import { testFiles } from "../__fixtures__/test-files";
import { getTmpDirPath, loadTestFiles } from "../test-utils";

describe("content utils", () => {
	describe("getSingleFileContent", () => {
		const input = { name: "button" };

		beforeAll(() => {
			templateAssetRegister.register();
		});

		beforeEach(async () => {
			vi.spyOn(fileSys, "getTemplateProcessedPath");
		});

		it("should return template content from templateStr", async () => {
			const operation = operationDecorator.amend(
				testData.makeAmendOperation({
					type: "prepend",
				}),
			);

			const result = await content.getSingleFileContent(operation, input);

			expect(result).toBe(testFiles.aggregateCss.templateStr);
			expect(fileSys.getTemplateProcessedPath).not.toHaveBeenCalled();
		});

		it("should return template content from templateFile", async () => {
			const operation = operationDecorator.create(testData.makeCreateOperation());
			const mergedData = {
				...input,
				...testData.themeData,
			};

			await loadTestFiles({
				"templates/component.tsx.hbs": testFiles.component.templateFileContent,
			});

			vi.spyOn(fs, "readFile");

			const result = await content.getSingleFileContent(operation, mergedData);

			expect(fileSys.getTemplateProcessedPath).toHaveBeenCalledWith(
				operation.templateFilePath,
				mergedData,
				store.state().configPath,
			);
			expect(result).toBe(testFiles.component.templateFileContent);
			expect(fs.readFile).toHaveBeenCalledWith(getTmpDirPath(operation.templateFilePath), "utf8");
		});

		it("should throw error when no templateStr or templateFile found for single file operation", async () => {
			const operation = {
				type: "prepend",
				filePath: "src/css/file.css",
			};

			await expect(content.getSingleFileContent(operation, input)).rejects.toThrow();

			expect(logger.error).toBeCalledWith(expect.stringContaining("No template string or template file value found"));
			expect(fileSys.getTemplateProcessedPath).not.toHaveBeenCalled();
		});

		it("should throw error when error encountered reading file", async () => {
			const operation = operationDecorator.amend(
				testData.makeAmendOperation({
					type: "prepend",
					templateStr: undefined,
					templateFilePath: "templates/style.css.hbs",
				}),
			);

			vi.spyOn(fs, "readFile").mockRejectedValueOnce(new Error("Simulated read error"));

			await expect(content.getSingleFileContent(operation, input)).rejects.toThrow();
		});
	});
});
