import fs from "node:fs/promises";
import { operationDecorators } from "../../../src/core/operations/operation-decorators";
import { ops } from "../../../src/core/operations/ops";
import { content } from "../../../src/utils/content";
import { fileSys } from "../../../src/utils/file-sys";
import { templateAssetRegister } from "../../../src/utils/template-asset-register";
import { testData } from "../../__fixtures__/test-data";
import { testFiles } from "../../__fixtures__/test-files";
import { getTmpDirPath, loadTestFiles, writeTestFile } from "../../test-utils";

describe("create", () => {
	const mergedData = {
		name: "page header",
		...testData.themeData,
	};

	beforeAll(async () => {
		templateAssetRegister.register();
	});

	beforeEach(async () => {
		await loadTestFiles(testFiles.existingFiles);
	});

	it("should create file using templateFile", async () => {
		const operation = operationDecorators.create(testData.makeCreateOperation());
		const componentFilePath = getTmpDirPath("src/components/page-header/page-header.tsx");
		const mergedData = {
			name: "page header",
			...testData.themeData,
		};

		await ops.create(operation, mergedData);

		const fileResult = await fs.readFile(componentFilePath, "utf8");
		expect(fileResult).toContain("PageHeader()");
		expect(fileResult).toContain("denim-page-header");
	});

	it("should create a file using templateStr", async () => {
		const operation = operationDecorators.create(
			testData.makeCreateOperation({
				templateFilePath: undefined,
				filePath: testFiles.componentCss.filePath,
				templateStr: testFiles.componentCss.templateStr,
			}),
		);
		const mergedData = {
			name: "checkbox input",
			...testData.themeData,
		};
		const cssFilePath = getTmpDirPath("src/components/checkbox-input/checkbox-input.css");

		await ops.create(operation, mergedData);

		const fileResult = await fs.readFile(cssFilePath, "utf8");
		expect(fileResult).toContain(".checkbox-input {");
		expect(fileResult).toContain("background-color: denim-600;");
	});

	it("should throw error if file already exists and skipIfExists is false", async () => {
		const operation = operationDecorators.create(
			testData.makeCreateOperation({
				templateFilePath: undefined,
			}),
		);

		await loadTestFiles({
			"src/components/page-header/page-header.tsx": "page header",
		});

		vi.spyOn(fs, "readFile");
		vi.spyOn(fileSys, "fileExists");

		await expect(ops.create(operation, mergedData)).rejects.toThrow();

		expect(fileSys.fileExists).toHaveResolvedWith(true);
		expect(fs.readFile).not.toHaveBeenCalled();
	});

	it("should skip operation if file already exists and skipIfExists is true", async () => {
		const operation = operationDecorators.create(
			testData.makeCreateOperation({
				skipIfExists: true,
			}),
		);

		vi.spyOn(content, "getSingleFileContent");

		await loadTestFiles({
			"src/components/page-header/page-header.tsx": "page header",
		});

		await ops.create(operation, mergedData);

		expect(fileSys.fileExists).toHaveResolvedWith(true);
		expect(content.getSingleFileContent).not.toHaveBeenCalled();
	});

	it("should overwrite file if file already exists and overwrite is true", async () => {
		const operation = operationDecorators.create(
			testData.makeCreateOperation({
				templateFilePath: undefined,
				templateStr: testFiles.component.templateFileContent,
				overwrite: true,
			}),
		);
		const mergedData = {
			name: "alert",
			...testData.themeData,
		};
		const alertFilePath = getTmpDirPath("src/components/alert/alert.tsx");

		await writeTestFile("src/components/alert/alert.tsx", "to be overwritten as alert component");

		const existingFileResult = await fs.readFile(alertFilePath, "utf8");
		expect(existingFileResult).toContain("overwritten");

		await ops.create(operation, mergedData);

		const newContentResult = await fs.readFile(alertFilePath, "utf8");
		expect(newContentResult).not.toContain("overwritten");

		expect(fileSys.fileExists).toHaveResolvedWith(true);
		expect(content.getSingleFileContent).toHaveBeenCalled();
	});

	it("should throw error when writing file fails", async () => {
		const operation = operationDecorators.create(testData.makeCreateOperation());

		vi.spyOn(fs, "writeFile").mockRejectedValueOnce(new Error());

		await expect(ops.create(operation, mergedData)).rejects.toThrow();
	});
});
