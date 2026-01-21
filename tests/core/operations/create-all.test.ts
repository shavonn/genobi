import fs from "node:fs/promises";
import { operationDecorator } from "../../../src/core/operations/operation-decorator";
import { ops } from "../../../src/core/operations/ops";
import { templates } from "../../../src/utils/templates";
import { testData } from "../../__fixtures__/test-data";
import { getTmpDirPath, loadTestFiles } from "../../test-utils";

describe("createAll", async () => {
  let componentFilePath: string;
  let cssFilePath: string;

  const mergedData = {
    name: "checkbox input",
    ...testData.themeData,
  };

  beforeAll(async () => {
    templates.registerComponents();
  });

  beforeEach(async () => {
    componentFilePath = getTmpDirPath("src/components/checkbox-input/checkbox-input.tsx");
    cssFilePath = getTmpDirPath("src/components/checkbox-input/checkbox-input.css");
  });

  it("should create files matching glob, removing template base path", async () => {
    const operation = operationDecorator.createAll(testData.makeCreateAllOperation());

    await ops.createAll(operation, mergedData);

    const fileResult = await fs.readFile(componentFilePath, "utf8");
    expect(fileResult).toContain("CheckboxInput(props)");
    expect(await fs.access(componentFilePath, fs.constants.F_OK)).toBe(undefined);
    expect(await fs.access(cssFilePath, fs.constants.F_OK)).toBe(undefined);
  });

  it("should continue creating if and error is thrown and haltOnError is false", async () => {
    const operation = operationDecorator.createAll(
      testData.makeCreateAllOperation({
        haltOnError: false,
      }),
    );

    vi.spyOn(fs, "readFile").mockRejectedValueOnce(new Error("Simulated read error"));

    await ops.createAll(operation, mergedData);

    const fileResult = await fs.readFile(cssFilePath, "utf8");
    expect(fileResult).toContain(".checkbox-input {");
    await expect(fs.access(componentFilePath, fs.constants.F_OK)).rejects.toThrow();
    expect(await fs.access(cssFilePath, fs.constants.F_OK)).toBe(undefined);
  });

  it("should throw error if no files are found with glob", async () => {
    const operation = operationDecorator.createAll(
      testData.makeCreateAllOperation({
        templateFilesGlob: "templates/components/*.hbs",
      }),
    );

    await expect(ops.createAll(operation, mergedData)).rejects.toThrow();
  });

  it("should throw error if file already exists when skipIfExists is false", async () => {
    const operation = operationDecorator.createAll(testData.makeCreateAllOperation());

    await loadTestFiles({
      "src/components/checkbox-input/checkbox-input.tsx": "exists",
      "src/components/checkbox-input/checkbox-input.css": "exists",
    });

    // Uses atomic write with exclusive flag (wx) - throws FileExistsError atomically
    // This prevents TOCTOU race conditions between checking file existence and writing
    await expect(ops.createAll(operation, mergedData)).rejects.toThrow(/File already exists/);

    // Existing file should not be modified
    expect(await fs.access(cssFilePath, fs.constants.F_OK)).toBe(undefined);
  });

  it("should skip if file already exists when skipIfExists is true", async () => {
    const operation = operationDecorator.createAll(
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
    const operation = operationDecorator.createAll(
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
    expect(fileResult).toContain("CheckboxInput(props)");
  });
});
