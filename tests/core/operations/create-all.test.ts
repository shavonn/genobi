import fs from "node:fs/promises";
import { expect } from "vitest";
import { operationDecorators } from "../../../src/core/operations/operation-decorators";
import { ops } from "../../../src/core/operations/ops";
import { fileSys } from "../../../src/utils/file-sys";
import { helperRegister } from "../../../src/utils/helpers/helper-register";
import { testData } from "../../__fixtures__/test-data";
import { testFiles } from "../../__fixtures__/test-files";
import { getTmpDirPath, loadTestFiles } from "../../test-utils";

describe("createAll", async () => {
	let componentFilePath: string;
	let cssFilePath: string;

	const mergedData = {
		name: "checkbox input",
		...testData.themeData,
	};

	beforeAll(async () => {
		helperRegister.register();
	});

	beforeEach(async () => {
		componentFilePath = getTmpDirPath("src/components/checkbox-input/checkbox-input.tsx");
		cssFilePath = getTmpDirPath("src/components/checkbox-input/checkbox-input.css");

		await loadTestFiles(testFiles.existingFiles);
	});

	it("should create files matching glob, removing template base path", async () => {
		const operation = operationDecorators.createAll(testData.makeCreateAllOperation());

		await ops.createAll(operation, mergedData);

		const fileResult = await fs.readFile(componentFilePath, "utf8");
		expect(fileResult).toContain("CheckboxInput()");
		expect(await fs.access(componentFilePath, fs.constants.F_OK)).toBe(undefined);
		expect(await fs.access(cssFilePath, fs.constants.F_OK)).toBe(undefined);
	});

	it("should continue creating if and error is thrown and haltOnError is false", async () => {
		const operation = operationDecorators.createAll(
			testData.makeCreateAllOperation({
				haltOnError: false,
			}),
		);

		vi.spyOn(fs, "readFile").mockRejectedValueOnce(new Error("Read error"));

		await ops.createAll(operation, mergedData);

		const fileResult = await fs.readFile(cssFilePath, "utf8");
		expect(fileResult).toContain(".checkbox-input {");
		await expect(fs.access(componentFilePath, fs.constants.F_OK)).rejects.toThrow();
		expect(await fs.access(cssFilePath, fs.constants.F_OK)).toBe(undefined);
	});

	it("should throw error if no files are found with glob", async () => {
		const operation = operationDecorators.createAll(
			testData.makeCreateAllOperation({
				templateFilesGlob: "templates/components/*.hbs",
			}),
		);

		await expect(ops.createAll(operation, mergedData)).rejects.toThrow();
	});

	it("should throw error if file already exists when skipIfExists is false", async () => {
		const operation = operationDecorators.createAll(testData.makeCreateAllOperation());

		await loadTestFiles({
			"src/components/checkbox-input/checkbox-input.tsx": "exists",
			"src/components/checkbox-input/checkbox-input.css": "exists",
		});

		vi.spyOn(fileSys, "writeToFile");

		await expect(ops.createAll(operation, mergedData)).rejects.toThrowError();

		expect(fileSys.writeToFile).not.toHaveBeenCalled();
		expect(await fs.access(cssFilePath, fs.constants.F_OK)).toBe(undefined);
	});

	it("should skip if file already exists when skipIfExists is true", async () => {
		const operation = operationDecorators.createAll(
			testData.makeCreateAllOperation({
				skipIfExists: true,
			}),
		);
		await loadTestFiles({
			"src/components/checkbox-input/checkbox-input.tsx": "exists",
			"src/components/checkbox-input/checkbox-input.css": "exists",
		});

		const existingFileResult = await fs.readFile(componentFilePath, "utf8");
		expect(existingFileResult).toContain("exists");

		await expect(ops.createAll(operation, mergedData)).resolves.toBe(undefined);

		const fileResult = await fs.readFile(componentFilePath, "utf8");
		expect(fileResult).toContain("exists");
	});

	it("should overwrite if file already exists when overwrite is true", async () => {
		const operation = operationDecorators.createAll(
			testData.makeCreateAllOperation({
				overwrite: true,
			}),
		);
		await loadTestFiles({
			"src/components/checkbox-input/checkbox-input.tsx": "exists",
			"src/components/checkbox-input/checkbox-input.css": "exists",
		});

		const existingFileResult = await fs.readFile(componentFilePath, "utf8");
		expect(existingFileResult).toContain("exists");

		await expect(ops.createAll(operation, mergedData)).resolves.toBe(undefined);

		const fileResult = await fs.readFile(componentFilePath, "utf8");
		expect(fileResult).toContain("CheckboxInput()");
	});
});
