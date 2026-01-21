import fs from "node:fs/promises";
import { store } from "../../src/config-store";
import { PathTraversalError } from "../../src/errors";
import { fileSys } from "../../src/utils/file-sys";
import { getTmpDirPath, loadTestFiles } from "../test-utils";

describe("path and dir utils", () => {
  describe("ensureDirectoryExists", async () => {
    it("should create a directory if it does not exist", async () => {
      await fileSys.ensureDirectoryExists("path/to/dir");

      expect(await fs.access(getTmpDirPath("path/to/dir"), fs.constants.F_OK)).toBe(undefined);
    });

    it("should ignore EEXIST errors", async () => {
      const error = new Error("Directory exists");
      (error as NodeJS.ErrnoException).code = "EEXIST";

      vi.spyOn(fs, "mkdir").mockRejectedValueOnce(error);

      await expect(fileSys.ensureDirectoryExists("path/to/dir")).resolves.not.toThrow();
    });

    it("should throw other errors when mkdir encounters an error", async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error("Simulated mkdir error"));

      await expect(fileSys.ensureDirectoryExists("path/to/dir")).rejects.toThrow();
    });
  });

  describe("fileExists", async () => {
    it("should return true if file exists", async () => {
      const file = getTmpDirPath("where/a/file/is.txt");

      await loadTestFiles({
        "where/a/file/is.txt": "I think. Therefore, I am.",
      });

      const result = await fileSys.fileExists(file);

      expect(result).toBe(true);
    });

    it("should return false if file does not exist", async () => {
      const result = await fileSys.fileExists("where/a/file/is/not.txt");

      expect(result).toBe(false);
    });
  });

  describe("getTemplateProcessedPath", () => {
    it("should process template and resolve path", () => {
      const template = "src/components/{{name}}/{{name}}.js";
      const data = { name: "dropdown" };

      const result = fileSys.getTemplateProcessedPath(template, data, store.state().destinationBasePath);

      expect(result).toBe(getTmpDirPath("src/components/dropdown/dropdown.js"));
    });

    it("should throw PathTraversalError when path escapes destination directory", () => {
      const template = "{{path}}/file.js";
      const data = { path: "../../../etc" };

      expect(() => {
        fileSys.getTemplateProcessedPath(template, data, store.state().destinationBasePath);
      }).toThrow(PathTraversalError);
    });

    it("should throw PathTraversalError for absolute paths outside destination", () => {
      const template = "{{path}}";
      const data = { path: "/etc/passwd" };

      expect(() => {
        fileSys.getTemplateProcessedPath(template, data, store.state().destinationBasePath);
      }).toThrow(PathTraversalError);
    });

    it("should allow paths that resolve within the destination directory", () => {
      const template = "src/../src/components/{{name}}.js";
      const data = { name: "button" };

      const result = fileSys.getTemplateProcessedPath(template, data, store.state().destinationBasePath);

      expect(result).toBe(getTmpDirPath("src/components/button.js"));
    });

    it("should allow paths at the root of the destination directory", () => {
      const template = "{{name}}.js";
      const data = { name: "index" };

      const result = fileSys.getTemplateProcessedPath(template, data, store.state().destinationBasePath);

      expect(result).toBe(getTmpDirPath("index.js"));
    });
  });

  describe("resolveSafePath", () => {
    it("should resolve a relative path within destination", () => {
      const result = fileSys.resolveSafePath("src/file.js", store.state().destinationBasePath);

      expect(result).toBe(getTmpDirPath("src/file.js"));
    });

    it("should throw PathTraversalError when path escapes destination directory", () => {
      expect(() => {
        fileSys.resolveSafePath("../../../etc/passwd", store.state().destinationBasePath);
      }).toThrow(PathTraversalError);
    });

    it("should throw PathTraversalError for absolute paths outside destination", () => {
      expect(() => {
        fileSys.resolveSafePath("/etc/passwd", store.state().destinationBasePath);
      }).toThrow(PathTraversalError);
    });

    it("should allow paths that normalize within the destination", () => {
      const result = fileSys.resolveSafePath("src/../src/components/file.js", store.state().destinationBasePath);

      expect(result).toBe(getTmpDirPath("src/components/file.js"));
    });
  });
});
