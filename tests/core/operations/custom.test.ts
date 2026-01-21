import { beforeEach, describe, expect, it, vi } from "vitest";
import { store } from "../../../src/config-store";
// Import after mocks are set up
import { custom, registered } from "../../../src/core/operations/custom";
import { GenobiError } from "../../../src/errors";
import type { CustomOperation, CustomOperationHandler, TemplateData } from "../../../src/types/operation";
import { fileSys } from "../../../src/utils/file-sys";
import { logger } from "../../../src/utils/logger";

vi.mock("../../../src/config-store", () => ({
  store: {
    state: vi.fn(),
  },
}));

vi.mock("../../../src/utils/file-sys", () => ({
  fileSys: {
    readFromFile: vi.fn(),
    writeToFile: vi.fn(),
    resolveSafePath: vi.fn(),
  },
}));

describe("custom operations", () => {
  const mockState = {
    destinationBasePath: "/test/destination",
    configPath: "/test/config",
    operations: new Map<string, CustomOperationHandler>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockState.operations = new Map();
    vi.mocked(store.state).mockReturnValue(mockState as any);
  });

  describe("custom", () => {
    it("should execute a sync custom operation", async () => {
      const mockAction = vi.fn();
      const operation: CustomOperation = {
        type: "custom",
        name: "sync-operation",
        action: mockAction,
      };
      const data: TemplateData = { name: "test" };

      await custom(operation, data);

      expect(mockAction).toHaveBeenCalledOnce();
      expect(mockAction.mock.calls[0][0]).toEqual(data);
      expect(mockAction.mock.calls[0][1]).toMatchObject({
        destinationPath: "/test/destination",
        configPath: "/test/config",
      });
      expect(logger.info).toHaveBeenCalledWith("Running custom operation: sync-operation");
      expect(logger.success).toHaveBeenCalledWith("Custom operation completed: sync-operation");
    });

    it("should execute an async custom operation", async () => {
      const mockAction = vi.fn().mockResolvedValue(undefined);
      const operation: CustomOperation = {
        type: "custom",
        name: "async-operation",
        action: mockAction,
      };
      const data: TemplateData = { name: "test" };

      await custom(operation, data);

      expect(mockAction).toHaveBeenCalledOnce();
      expect(logger.success).toHaveBeenCalledWith("Custom operation completed: async-operation");
    });

    it("should provide logger in context", async () => {
      let capturedContext: any;
      const operation: CustomOperation = {
        type: "custom",
        name: "logger-test",
        action: (_data, context) => {
          capturedContext = context;
        },
      };

      await custom(operation, {});

      expect(capturedContext.logger).toBeDefined();
      expect(typeof capturedContext.logger.info).toBe("function");
      expect(typeof capturedContext.logger.warn).toBe("function");
      expect(typeof capturedContext.logger.error).toBe("function");
      expect(typeof capturedContext.logger.debug).toBe("function");
      expect(typeof capturedContext.logger.success).toBe("function");
    });

    it("should provide replaceInFile in context", async () => {
      let capturedContext: any;
      const operation: CustomOperation = {
        type: "custom",
        name: "replace-test",
        action: (_data, context) => {
          capturedContext = context;
        },
      };

      await custom(operation, {});

      expect(typeof capturedContext.replaceInFile).toBe("function");
    });

    describe("replaceInFile", () => {
      it("should replace content in a file with string pattern", async () => {
        vi.mocked(fileSys.resolveSafePath).mockReturnValue("/test/destination/test.txt");
        vi.mocked(fileSys.readFromFile).mockResolvedValue("Hello PLACEHOLDER world");
        vi.mocked(fileSys.writeToFile).mockResolvedValue(undefined);

        const operation: CustomOperation = {
          type: "custom",
          name: "replace-string-test",
          action: async (_data, context) => {
            await context.replaceInFile("test.txt", "PLACEHOLDER", "beautiful");
          },
        };

        await custom(operation, {});

        expect(fileSys.resolveSafePath).toHaveBeenCalledWith("test.txt", "/test/destination");
        expect(fileSys.readFromFile).toHaveBeenCalledWith("/test/destination/test.txt");
        expect(fileSys.writeToFile).toHaveBeenCalledWith("/test/destination/test.txt", "Hello beautiful world");
      });

      it("should replace content in a file with regex pattern", async () => {
        vi.mocked(fileSys.resolveSafePath).mockReturnValue("/test/destination/test.txt");
        vi.mocked(fileSys.readFromFile).mockResolvedValue("foo 123 bar 456");
        vi.mocked(fileSys.writeToFile).mockResolvedValue(undefined);

        const operation: CustomOperation = {
          type: "custom",
          name: "replace-regex-test",
          action: async (_data, context) => {
            await context.replaceInFile("test.txt", /\d+/g, "NUM");
          },
        };

        await custom(operation, {});

        expect(fileSys.writeToFile).toHaveBeenCalledWith("/test/destination/test.txt", "foo NUM bar NUM");
      });

      it("should not write to file when no changes made", async () => {
        vi.mocked(fileSys.resolveSafePath).mockReturnValue("/test/destination/test.txt");
        vi.mocked(fileSys.readFromFile).mockResolvedValue("Hello world");
        vi.mocked(fileSys.writeToFile).mockResolvedValue(undefined);

        const operation: CustomOperation = {
          type: "custom",
          name: "no-change-test",
          action: async (_data, context) => {
            await context.replaceInFile("test.txt", "NOT_FOUND", "replacement");
          },
        };

        await custom(operation, {});

        expect(logger.debug).toHaveBeenCalledWith(
          "No changes made to file (pattern not found or replacement identical)",
        );
        expect(fileSys.writeToFile).not.toHaveBeenCalled();
      });

      it("should use resolveSafePath to prevent path traversal", async () => {
        vi.mocked(fileSys.resolveSafePath).mockReturnValue("/test/destination/safe/path.txt");
        vi.mocked(fileSys.readFromFile).mockResolvedValue("content");
        vi.mocked(fileSys.writeToFile).mockResolvedValue(undefined);

        const operation: CustomOperation = {
          type: "custom",
          name: "path-validation-test",
          action: async (_data, context) => {
            await context.replaceInFile("../../../etc/passwd", "root", "safe");
          },
        };

        await custom(operation, {});

        // Verify resolveSafePath is called with the potentially dangerous path
        expect(fileSys.resolveSafePath).toHaveBeenCalledWith("../../../etc/passwd", "/test/destination");
      });
    });
  });

  describe("registered", () => {
    it("should execute a registered operation", async () => {
      const mockHandler = vi.fn();
      mockState.operations.set("my-operation", mockHandler);

      await registered("my-operation", { name: "test" });

      expect(mockHandler).toHaveBeenCalledOnce();
      expect(mockHandler.mock.calls[0][0]).toEqual({ name: "test" });
      expect(mockHandler.mock.calls[0][1]).toMatchObject({
        destinationPath: "/test/destination",
        configPath: "/test/config",
      });
      expect(logger.info).toHaveBeenCalledWith("Running registered operation: my-operation");
      expect(logger.success).toHaveBeenCalledWith("Registered operation completed: my-operation");
    });

    it("should execute an async registered operation", async () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined);
      mockState.operations.set("async-operation", mockHandler);

      await registered("async-operation", {});

      expect(mockHandler).toHaveBeenCalledOnce();
      expect(logger.success).toHaveBeenCalledWith("Registered operation completed: async-operation");
    });

    it("should throw error for unregistered operation", async () => {
      await expect(registered("non-existent", {})).rejects.toThrow(GenobiError);
      await expect(registered("non-existent", {})).rejects.toThrow('Operation "non-existent" is not registered');
    });
  });
});
