import fs from "node:fs/promises";
import { pathDir } from "../../src/utils/path-dir";
import { getTmpDirPath, loadTestFiles } from "../test-utils";

describe("path and dir utils", () => {
	describe("ensureDirectoryExists", async () => {
		it("should create a directory if it does not exist", async () => {
			await pathDir.ensureDirectoryExists("path/to/dir");

			expect(await fs.access(getTmpDirPath("path/to/dir"), fs.constants.F_OK)).toBe(undefined);
		});

		it("should ignore EEXIST errors", async () => {
			const error = new Error("Directory exists");
			(error as NodeJS.ErrnoException).code = "EEXIST";

			vi.spyOn(fs, "mkdir").mockRejectedValueOnce(error);

			await expect(pathDir.ensureDirectoryExists("path/to/dir")).resolves.not.toThrow();
		});

		it("should throw other errors when mkdir encounters an error", async () => {
			vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error());

			await expect(pathDir.ensureDirectoryExists("path/to/dir")).rejects.toThrow();
		});
	});

	describe("fileExists", async () => {
		it("should return true if file exists", async () => {
			const file = getTmpDirPath("where/a/file/is.txt");

			await loadTestFiles({
				"where/a/file/is.txt": "I think. Therefore, I am.",
			});

			const result = await pathDir.fileExists(file);

			expect(result).toBe(true);
		});

		it("should return false if file does not exist", async () => {
			const result = await pathDir.fileExists("where/a/file/is/not.txt");

			expect(result).toBe(false);
		});
	});

	describe("getTemplateProcessedPath", () => {
		it("should process template and resolve path", () => {
			const template = "src/components/{{name}}/{{name}}.js";
			const data = { name: "dropdown" };

			const result = pathDir.getTemplateProcessedPath(template, data);

			expect(result).toBe(getTmpDirPath("src/components/dropdown/dropdown.js"));
		});
	});
});
