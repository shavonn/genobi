import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../src/errors";
import { logger } from "../../src/utils/logger";
import { validation } from "../../src/utils/validation";

describe("validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateGenerator", () => {
    it("should validate a valid generator", () => {
      const validGenerator = {
        description: "Test generator",
        prompts: [
          {
            type: "input",
            name: "name",
            message: "What is the name?",
          },
        ],
        operations: [
          {
            type: "create",
            filePath: "test.txt",
            templateStr: "Hello {{name}}",
          },
        ],
      };

      expect(() => validation.validateGenerator("test-gen", validGenerator)).not.toThrow();
    });

    it("should throw for empty generator id", () => {
      expect(() => validation.validateGenerator("", {})).toThrow(ValidationError);
      expect(() => validation.validateGenerator("", {})).toThrow("Validation failed for generator id: cannot be empty");
    });

    it("should throw for missing description", () => {
      const invalidGenerator = {
        operations: [{ type: "create", filePath: "test.txt", templateStr: "content" }],
      };

      expect(() => validation.validateGenerator("test", invalidGenerator)).toThrow(
        "Validation failed for generator.description: is required",
      );
    });

    it("should throw for empty operations", () => {
      const invalidGenerator = {
        description: "Test",
        operations: [],
      };

      expect(() => validation.validateGenerator("test", invalidGenerator)).toThrow(
        "Validation failed for generator.operations: cannot be empty",
      );
    });

    it("should throw for missing operations", () => {
      const invalidGenerator = {
        description: "Test",
      };

      expect(() => validation.validateGenerator("test", invalidGenerator)).toThrow(
        "Validation failed for generator.operations: is required",
      );
    });

    it("should validate prompts correctly", () => {
      const generatorWithInvalidPrompt = {
        description: "Test",
        prompts: [
          {
            type: "input",
            // missing name
          },
        ],
        operations: [{ type: "create", filePath: "test.txt", templateStr: "content" }],
      };

      expect(() => validation.validateGenerator("test", generatorWithInvalidPrompt)).toThrow(
        "Validation failed for prompts[0].name: is required",
      );
    });

    it("should validate prompt types", () => {
      const generatorWithInvalidPromptType = {
        description: "Test",
        prompts: [
          {
            type: "invalid-type",
            name: "test",
          },
        ],
        operations: [{ type: "create", filePath: "test.txt", templateStr: "content" }],
      };

      expect(() => validation.validateGenerator("test", generatorWithInvalidPromptType)).toThrow(
        "Validation failed for prompts[0].type: must be one of:",
      );
    });

    it("should require choices for list-based prompts", () => {
      const generatorWithListPrompt = {
        description: "Test",
        prompts: [
          {
            type: "list",
            name: "choice",
            message: "Choose one",
            // missing choices
          },
        ],
        operations: [{ type: "create", filePath: "test.txt", templateStr: "content" }],
      };

      expect(() => validation.validateGenerator("test", generatorWithListPrompt)).toThrow(
        'Validation failed for prompts[0].choices: is required for type "list"',
      );
    });

    it("should warn about self-referencing forMany operations", () => {
      const generatorWithSelfReference = {
        description: "Test",
        operations: [
          {
            type: "forMany",
            generatorId: "self-ref",
            items: [1, 2, 3],
          },
        ],
      };

      expect(() => validation.validateGenerator("self-ref", generatorWithSelfReference)).not.toThrow();
      expect(logger.warn).toHaveBeenCalledWith(
        "Warning: operations[0] references itself (self-ref), this could cause infinite recursion",
      );
    });
  });

  describe("validateHelper", () => {
    it("should validate a valid helper", () => {
      const validHelper = () => "test";
      expect(() => validation.validateHelper("testHelper", validHelper)).not.toThrow();
    });

    it("should throw for non-function helper", () => {
      expect(() => validation.validateHelper("test", "not a function")).toThrow(
        "Validation failed for helper function: must be a function",
      );
    });

    it("should throw for empty helper name", () => {
      expect(() => validation.validateHelper("", () => {})).toThrow(
        "Validation failed for helper name: cannot be empty",
      );
    });

    it("should throw for reserved helper names", () => {
      const reservedNames = ["if", "unless", "each", "with", "lookup", "log"];
      reservedNames.forEach((name) => {
        expect(() => validation.validateHelper(name, () => {})).toThrow(
          `Validation failed for helper name: "${name}" is a reserved Handlebars helper name`,
        );
      });
    });
  });

  describe("validatePartial", () => {
    it("should validate a valid string partial", () => {
      expect(() => validation.validatePartial("test", "<div>{{content}}</div>")).not.toThrow();
    });

    it("should validate a valid function partial", () => {
      const partialFunc = () => "<div>test</div>";
      expect(() => validation.validatePartial("test", partialFunc)).not.toThrow();
    });

    it("should throw for invalid partial type", () => {
      expect(() => validation.validatePartial("test", 123)).toThrow(
        "Validation failed for partial: must be a string or template function",
      );
    });

    it("should throw for empty partial name", () => {
      expect(() => validation.validatePartial("", "content")).toThrow(
        "Validation failed for partial name: cannot be empty",
      );
    });
  });

  describe("validatePartialFilePath", () => {
    it("should validate a valid partial file path", () => {
      expect(() => validation.validatePartialFilePath("test", "templates/test.hbs")).not.toThrow();
    });

    it("should warn for non-standard file extensions", () => {
      expect(() => validation.validatePartialFilePath("test", "templates/test.xyz")).not.toThrow();
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("doesn't have a common template extension"));
    });

    it("should throw for empty file path", () => {
      expect(() => validation.validatePartialFilePath("test", "")).toThrow(
        "Validation failed for partial file path: cannot be empty",
      );
    });
  });

  describe("operation validation", () => {
    describe("create operation", () => {
      it("should validate a valid create operation", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "create",
              filePath: "test.txt",
              templateStr: "content",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should throw for missing filePath", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "create",
              templateStr: "content",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].filePath: is required",
        );
      });

      it("should throw for missing template source", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "create",
              filePath: "test.txt",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0]: must have either templateStr or templateFilePath",
        );
      });

      it("should throw for having both template sources", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "create",
              filePath: "test.txt",
              templateStr: "content",
              templateFilePath: "template.hbs",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0]: cannot have both templateStr and templateFilePath",
        );
      });

      it("should throw for conflicting skipIfExists and overwrite", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "create",
              filePath: "test.txt",
              templateStr: "content",
              skipIfExists: true,
              overwrite: true,
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0]: cannot have both skipIfExists and overwrite set to true",
        );
      });
    });

    describe("append/prepend operations", () => {
      it("should validate valid append operation", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "append",
              filePath: "test.txt",
              templateStr: "content",
              separator: "\n",
              unique: true,
              pattern: "// MARKER",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should validate pattern as RegExp", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "prepend",
              filePath: "test.txt",
              templateStr: "content",
              pattern: /test/g,
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should throw for invalid separator type", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "append",
              filePath: "test.txt",
              templateStr: "content",
              separator: 123,
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].separator: must be a string",
        );
      });
    });

    describe("createAll operation", () => {
      it("should validate valid createAll operation", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "createAll",
              destinationPath: "dist",
              templateFilesGlob: "templates/**/*.hbs",
              templateBasePath: "templates",
              verbose: false,
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should throw for missing destinationPath", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "createAll",
              templateFilesGlob: "templates/**/*.hbs",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].destinationPath: is required",
        );
      });

      it("should throw for missing templateFilesGlob", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "createAll",
              destinationPath: "dist",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].templateFilesGlob: is required",
        );
      });
    });

    describe("forMany operation", () => {
      it("should validate valid forMany operation with array", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "forMany",
              generatorId: "other-gen",
              items: [1, 2, 3],
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should validate valid forMany operation with function", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "forMany",
              generatorId: "other-gen",
              items: (_data: any[]) => [1, 2, 3],
              transformItem: (item: any, _index: number, _parentData: Record<string, any>) => ({ value: item }),
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should throw for missing generatorId", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "forMany",
              items: [1, 2, 3],
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].generatorId: is required",
        );
      });

      it("should throw for empty items array", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "forMany",
              generatorId: "other-gen",
              items: [],
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].items: array cannot be empty",
        );
      });

      it("should throw for invalid items type", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "forMany",
              generatorId: "other-gen",
              items: "not an array or function",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].items: must be an array or function",
        );
      });
    });

    describe("unknown operation type", () => {
      it("should throw for unknown operation type", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "unknown-type",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].type: must be one of:",
        );
      });
    });

    describe("custom operation", () => {
      it("should validate a valid custom operation", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "custom",
              name: "my-custom-op",
              action: () => {},
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).not.toThrow();
      });

      it("should throw for missing name", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "custom",
              action: () => {},
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].name: is required",
        );
      });

      it("should throw for empty name", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "custom",
              name: "",
              action: () => {},
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].name: cannot be empty",
        );
      });

      it("should throw for missing action", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "custom",
              name: "my-op",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].action: is required",
        );
      });

      it("should throw for non-function action", () => {
        const generator = {
          description: "Test",
          operations: [
            {
              type: "custom",
              name: "my-op",
              action: "not a function",
            },
          ],
        };

        expect(() => validation.validateGenerator("test", generator)).toThrow(
          "Validation failed for operations[0].action: must be a function",
        );
      });
    });
  });

  describe("validateOperationRegistration", () => {
    it("should validate a valid operation registration", () => {
      expect(() => validation.validateOperationRegistration("my-operation", () => {})).not.toThrow();
    });

    it("should throw for empty operation name", () => {
      expect(() => validation.validateOperationRegistration("", () => {})).toThrow(
        "Validation failed for operation name: cannot be empty",
      );
    });

    it("should throw for reserved operation type names", () => {
      const reservedNames = ["create", "createAll", "append", "prepend", "forMany", "custom"];
      reservedNames.forEach((name) => {
        expect(() => validation.validateOperationRegistration(name, () => {})).toThrow(
          `Validation failed for operation name: "${name}" is a reserved operation type`,
        );
      });
    });

    it("should throw for non-function handler", () => {
      expect(() => validation.validateOperationRegistration("my-op", "not a function")).toThrow(
        "Validation failed for operation handler: must be a function",
      );
    });
  });
});
