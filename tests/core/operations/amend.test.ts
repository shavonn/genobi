import fs from "node:fs/promises";
import { combiners } from "../../../src/core/operations/amend";
import { operationDecorators } from "../../../src/core/operations/operation-decorators";
import { ops } from "../../../src/core/operations/ops";
import { logger } from "../../../src/utils/logger";
import { templateAssetRegister } from "../../../src/utils/template-asset-register";
import { testData } from "../../__fixtures__/test-data";
import { testFiles } from "../../__fixtures__/test-files";
import { getTmpDirPath, writeTestFile } from "../../test-utils";

describe("amend", () => {
	let componentCssFilePath: string;

	beforeAll(async () => {
		templateAssetRegister.register();
	});

	beforeEach(async () => {
		componentCssFilePath = getTmpDirPath("src/css/components.css");
	});

	describe("amend operations", () => {
		it("should handle append operation", async () => {
			const appendOp = operationDecorators.amend(testData.makeAmendOperation({ type: "append" }));
			const input = { name: "label" };
			const processed = `@import "../components/label/label.css";`;

			await ops.append(appendOp, input);

			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(`${testFiles.aggregateCss.existing}\n${processed}`);
		});

		it("should handle prepend operation", async () => {
			const prependOp = operationDecorators.amend(testData.makeAmendOperation({ type: "prepend", separator: "\n\n" }));
			const input = { name: "navbar" };
			const processed = `@import "../components/navbar/navbar.css";`;

			await ops.prepend(prependOp, input);

			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(`${processed}\n\n${testFiles.aggregateCss.existing}`);
		});

		it("should skip if content already exists and unique is true", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "append",
					unique: true,
				}),
			);
			const input = { name: "footer" };
			const processed = `@import "../components/footer/footer.css";`;

			vi.spyOn(fs, "writeFile");

			await writeTestFile("src/css/components.css", `${processed}\n${testFiles.aggregateCss.existing}`);

			await ops.amendFile(operation, input);

			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Content already exists"));
			expect(fs.writeFile).not.toHaveBeenCalled();
		});

		it("should create a file if it doesn't exist", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({ type: "append", filePath: "src/css/components-too.css" }),
			);
			const input = { name: "caption" };
			const processed = `@import "../components/caption/caption.css";`;
			const componentCssFilePath = getTmpDirPath("src/css/components-too.css");

			await ops.amendFile(operation, input);

			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(processed);
		});

		it("should throw error for unknown amendment type", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "unknown-type",
				}),
			);

			await expect(ops.amendFile(operation, {})).rejects.toThrow("Unknown amendment operation type: unknown-type");
		});
	});

	describe("pattern matching", () => {
		it("should append after a regex pattern match", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "append",
					pattern: `table.css";`,
				}),
			);
			const input = { name: "foo" };
			const processed = `@import "../components/foo/foo.css";`;

			const opProcess = vi.spyOn(combiners.append, "process");

			await ops.amendFile(operation, input);

			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(
				`@import "../components/header/header.css";\n@import "../components/table/table.css";\n${processed}\n@import "../components/switch/switch.css";\n@import "../components/radio/radio.css";`,
			);
			expect(opProcess).toHaveReturnedWith(
				`@import "../components/header/header.css";\n@import "../components/table/table.css";\n${processed}\n@import "../components/switch/switch.css";\n@import "../components/radio/radio.css";`,
			);
		});

		it("should prepend before a regex pattern match", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "prepend",
					pattern: `@import "../components/radio/radio.css";`,
				}),
			);
			const input = { name: "bar" };
			const processed = `@import "../components/bar/bar.css";`;

			const opProcess = vi.spyOn(combiners.prepend, "process");

			await ops.amendFile(operation, input);

			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(
				`@import "../components/header/header.css";\n@import "../components/table/table.css";\n@import "../components/switch/switch.css";\n${processed}\n@import "../components/radio/radio.css";`,
			);
			expect(opProcess).toHaveReturnedWith(
				`@import "../components/header/header.css";\n@import "../components/table/table.css";\n@import "../components/switch/switch.css";\n${processed}\n@import "../components/radio/radio.css";`,
			);
		});

		it("should append at the end if pattern is not found", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "append",
					pattern: "not-found-pattern",
				}),
			);
			const input = { name: "foo bar" };
			const processed = `@import "../components/foo-bar/foo-bar.css";`;

			await ops.amendFile(operation, input);

			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Pattern not found"));
			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(`${testFiles.aggregateCss.existing}\n${processed}`);
		});

		it("should prepend at the beginning if pattern is not found", async () => {
			const operation = operationDecorators.amend(
				testData.makeAmendOperation({
					type: "prepend",
					pattern: "not-found-pattern",
				}),
			);
			const input = { name: "hello" };
			const processed = `@import "../components/hello/hello.css";`;

			await ops.amendFile(operation, input);

			expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Pattern not found"));
			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(`${processed}\n${testFiles.aggregateCss.existing}`);
		});
	});

	describe("error handling", () => {
		it("should throw error when reading file fails", async () => {
			const operation = operationDecorators.amend(testData.makeAmendOperation({ type: "append" }));
			const input = { name: "world" };

			vi.spyOn(fs, "readFile").mockRejectedValueOnce(new Error("Simulated read error"));

			await expect(ops.amendFile(operation, input)).rejects.toThrow();
		});

		it("should throw error when writing file fails", async () => {
			const operation = operationDecorators.amend(testData.makeAmendOperation({ type: "append" }));
			const input = { name: "hello world" };

			vi.spyOn(fs, "writeFile").mockRejectedValueOnce(new Error("Simulated write error"));

			await expect(ops.amendFile(operation, input)).rejects.toThrow();
		});
	});

	describe("convenience functions", () => {
		it("append function should set type to append", async () => {
			const operation = operationDecorators.amend(testData.makeAmendOperation());
			const input = { name: "hero" };
			const processed = `@import "../components/hero/hero.css";`;

			await ops.append(operation, input);

			// We can't directly verify the type was set internally,
			// but we can check the file was written correctly
			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(`${testFiles.aggregateCss.existing}\n${processed}`);
		});

		it("prepend function should set type to prepend", async () => {
			const operation = operationDecorators.amend(testData.makeAmendOperation());
			const input = { name: "tabs" };
			const processed = `@import "../components/tabs/tabs.css";`;

			await ops.prepend(operation, input);

			// We can't directly verify the type was set internally,
			// but we can check the file was written correctly
			const fileResult = await fs.readFile(componentCssFilePath, "utf8");
			expect(fileResult).toBe(`${processed}\n${testFiles.aggregateCss.existing}`);
		});
	});
});
