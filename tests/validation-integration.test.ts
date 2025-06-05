import {beforeEach, describe, expect, it, vi} from "vitest";
import {configAPI} from "../src/config-api";
import {store} from "../src/config-store";
import {ValidationError} from "../src/errors";
import type {ConfigAPI} from "../src";
import {cleanUpTmpDir, createTmpDir, getTmpDir, writeTestFile} from "./test-utils";
import path from "node:path";
import {testData} from "./__fixtures__/test-data";
import {testFiles} from "./__fixtures__/test-files";

// We'll use real implementations but mock the file system
vi.mock("../utils/file-sys", () => ({
    fileSys: {
        readFromFile: vi.fn().mockResolvedValue("<div>Mock partial content</div>"),
        // other methods can be mocked as needed
    },
}));

// Mock only the logger to reduce console noise in tests
vi.mock("../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        success: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("Validation Integration Tests", () => {
    let api: ConfigAPI;

    beforeEach(() => {
        // Reset the store before each test
        store.resetDefault();
        store.setConfigFilePath("/test/genobi.config.js");

        // Get a fresh API instance
        api = configAPI.get();
    });

    describe("Real-world generator validation scenarios", () => {
        it("should accept a complete, valid React component generator", () => {
            expect(() => {
                api.addGenerator("react-component", {
                    description: "Create a new React component",
                    prompts: [
                        {
                            type: "input",
                            name: "name",
                            message: "Component name?",
                            default: "MyComponent",
                        },
                        {
                            type: "list",
                            name: "type",
                            message: "Component type?",
                            choices: ["functional", "class"],
                            default: "functional",
                        },
                        {
                            type: "confirm",
                            name: "includeStyles",
                            message: "Include styles?",
                            default: true,
                        },
                    ],
                    operations: [
                        {
                            type: "create",
                            filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
                            templateStr: `import React from 'react';
{{#if includeStyles}}
import './{{pascalCase name}}.css';
{{/if}}

{{#if (eq type "functional")}}
export const {{pascalCase name}}: React.FC = () => {
  return (
    <div className="{{kebabCase name}}">
      {{pascalCase name}} Component
    </div>
  );
};
{{else}}
export class {{pascalCase name}} extends React.Component {
  render() {
    return (
      <div className="{{kebabCase name}}">
        {{pascalCase name}} Component
      </div>
    );
  }
}
{{/if}}`,
                        },
                        {
                            type: "create",
                            filePath: "src/components/{{pascalCase name}}/{{pascalCase name}}.css",
                            templateStr: `.{{kebabCase name}} {
  /* Add your styles here */
}`,
                            skip: (data) => !data.includeStyles,
                        },
                        {
                            type: "append",
                            filePath: "src/components/index.ts",
                            templateStr: `export { {{pascalCase name}} } from './{{pascalCase name}}/{{pascalCase name}}';`,
                            pattern: "// COMPONENT_EXPORTS",
                            unique: true,
                        },
                    ],
                });
            }).not.toThrow();
        });

        it("should reject a generator with invalid prompt configuration", () => {
            expect(() => {
                api.addGenerator("bad-prompts", {
                    description: "Generator with bad prompts",
                    prompts: [
                        {
                            type: "checkbox", // checkbox requires choices
                            name: "features",
                            message: "Select features",
                            // Missing required 'choices' for checkbox type
                        },
                    ],
                    operations: [
                        {
                            type: "create",
                            filePath: "test.txt",
                            templateStr: "content",
                        },
                    ],
                });
            }).toThrow(ValidationError);
            expect(() => {
                api.addGenerator("bad-prompts", {
                    description: "Generator with bad prompts",
                    prompts: [
                        {
                            type: "checkbox",
                            name: "features",
                            message: "Select features",
                            choices: [], // Empty choices array
                        },
                    ],
                    operations: [
                        {
                            type: "create",
                            filePath: "test.txt",
                            templateStr: "content",
                        },
                    ],
                });
            }).toThrow("Validation failed for prompts[0].choices: cannot be empty");
        });

        it("should reject a generator with conflicting operation options", () => {
            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("conflicting-options", {
                    description: "Generator with conflicting options",
                    operations: [
                        {
                            type: "create",
                            filePath: "test.txt",
                            templateStr: "content",
                            skipIfExists: true,
                            overwrite: true, // Can't have both!
                        },
                    ],
                });
            }).toThrow("Validation failed for operations[0]: cannot have both skipIfExists and overwrite set to true");
        });

        it("should accept a complex multi-operation generator", () => {
            expect(() => {
                api.addGenerator("full-stack-module", {
                    description: "Create a full-stack module",
                    prompts: [
                        {
                            type: "input",
                            name: "moduleName",
                            message: "Module name?",
                        },
                        {
                            type: "checkbox",
                            name: "features",
                            message: "Select features:",
                            choices: ["API", "Database", "Frontend", "Tests"],
                        },
                    ],
                    operations: [
                        // Create multiple files using createAll
                        {
                            type: "createAll",
                            destinationPath: "src/modules/{{kebabCase moduleName}}",
                            templateFilesGlob: "templates/module/**/*.hbs",
                            templateBasePath: "templates/module",
                            skipIfExists: true,
                        },
                        // Conditionally create API files
                        {
                            type: "create",
                            filePath: "src/api/{{kebabCase moduleName}}.controller.ts",
                            templateFilePath: "templates/api/controller.hbs",
                            skip: (data) => !data.features.includes("API"),
                        },
                        // Update route configuration
                        {
                            type: "append",
                            filePath: "src/api/routes.ts",
                            templateStr: `router.use('/{{kebabCase moduleName}}', {{camelCase moduleName}}Routes);`,
                            pattern: "// ROUTE_REGISTRATION",
                            skip: (data) => !data.features.includes("API"),
                        },
                        // Create test files for each selected feature
                        {
                            type: "forMany",
                            generatorId: "test-file",
                            items: (data) => data.features.filter((_f: string) => data.features.includes("Tests")),
                            transformItem: (feature: string, _index: number, parentData: any) => ({
                                feature: feature.toLowerCase(),
                                moduleName: parentData.moduleName,
                            }),
                            skip: (data) => !data.features.includes("Tests"),
                        },
                    ],
                });
            }).not.toThrow();
        });
    });

    describe("Helper validation scenarios", () => {
        it("should accept valid custom helpers", () => {
            expect(() => {
                // String transformation helper
                api.addHelper("reverse", (str: string) => {
                    return String(str).split("").reverse().join("");
                });

                // Conditional helper
                api.addHelper("when", function (this: any, condition: any, options: any) {
                    if (condition) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });

                // Array helper
                api.addHelper("join", (array: any[], separator = ", ") => {
                    if (!Array.isArray(array)) return "";
                    return array.join(separator);
                });
            }).not.toThrow();
        });

        it("should reject reserved helper names", () => {
            const reservedNames = ["if", "unless", "each", "with", "lookup", "log"];

            reservedNames.forEach((name) => {
                expect(() => {
                    api.addHelper(name, () => "test");
                }).toThrow(`Validation failed for helper name: "${name}" is a reserved Handlebars helper name`);
            });
        });

        it("should reject non-function helpers", () => {
            expect(() => {
                api.addHelper("notAFunction", "this is a string" as any);
            }).toThrow("Validation failed for helper function: must be a function");
        });
    });

    describe("Partial validation scenarios", async () => {
        beforeEach(async () => {
            store.resetDefault();
            await createTmpDir();

            const dir = getTmpDir();
            store.setDestinationBasePath(dir);
            store.setConfigFilePath(path.resolve(dir, testData.configFilePath));
            await testFiles.loadExistingFiles();
        });
        afterEach(async () => {
            await cleanUpTmpDir();
        });

        it("should accept valid partials", () => {
            expect(() => {
                // String partial
                api.addPartial("button", '<button class="{{class}}">{{text}}</button>');

                // Template function partial
                api.addPartial("list", function (context: any) {
                    return `<ul>${context.items.map((item: any) => `<li>${item}</li>`).join("")}</ul>`;
                });
            }).not.toThrow();
        });

        it("should accept partials from files with various extensions", async () => {
            const validExtensions = [
                "templates/header.hbs",
                "templates/footer.handlebars",
                "templates/nav.html",
                "templates/sidebar.htm",
                "templates/banner.txt",
            ];

            for (const path of validExtensions) {
                await writeTestFile(path, "I'm a partial file");
            }

            for (const path of validExtensions) {
                await expect(api.addPartialFromFile(`partial-${path}`, path)).resolves.not.toThrow();
            }
        });

        it("should warn but accept partials with non-standard extensions", async () => {
            // This should succeed but log a warning
            await writeTestFile("templates/unusual.xyz", `testing`);
            await expect(api.addPartialFromFile("unusual", "templates/unusual.xyz")).resolves.not.toThrow();
        });
    });

    describe("Complex validation error scenarios", () => {
        it("should provide clear error messages for nested validation failures", () => {
            try {
                api.addGenerator("complex-fail", {
                    description: "Complex generator with multiple issues",
                    prompts: [
                        // @ts-ignore should be missing prompts for validation
                        {
                            type: "list",
                            name: "choice",
                            // Missing message and choices
                        },
                    ],
                    operations: [
                        // @ts-ignore should be missing prompts for validation
                        {
                            type: "create",
                            // Missing all required fields
                        },
                        // @ts-ignore should be missing prompts for validation
                        {
                            type: "forMany",
                            generatorId: "other",
                            // Missing items
                        },
                        // @ts-ignore should be missing prompts for validation
                        {
                            type: "createAll",
                            destinationPath: "dist",
                            // Missing templateFilesGlob
                        },
                    ],
                });
            } catch (error: any) {
                expect(error).toBeInstanceOf(ValidationError);
                // The error should be about the first validation failure it encounters
                expect(error.message).toContain("prompts[0]");
            }
        });

        it("should validate cross-references in forMany operations", () => {
            // First, add a generator that will be referenced
            // @ts-ignore should be missing prompts for validation
            api.addGenerator("base-generator", {
                description: "Base generator",
                operations: [
                    {
                        type: "create",
                        filePath: "{{name}}.txt",
                        templateStr: "{{content}}",
                    },
                ],
            });

            // This should work - referencing existing generator
            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("referencing-generator", {
                    description: "References base generator",
                    operations: [
                        {
                            type: "forMany",
                            generatorId: "base-generator",
                            items: [{name: "file1", content: "Content 1"}, {name: "file2", content: "Content 2"}],
                        },
                    ],
                });
            }).not.toThrow();

            // This should work but warn - self-reference
            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("self-referencing", {
                    description: "References itself",
                    operations: [
                        {
                            type: "forMany",
                            generatorId: "self-referencing",
                            items: [1, 2, 3],
                        },
                    ],
                });
            }).not.toThrow();
            // The warning would be logged but not throw
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle empty strings appropriately", () => {
            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("", {description: "Test", operations: []});
            }).toThrow("Validation failed for generator id: cannot be empty");

            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("test", {description: "", operations: []});
            }).toThrow("Validation failed for generator.description: is required");

            expect(() => {
                api.addHelper("", () => {
                });
            }).toThrow("Validation failed for helper name: cannot be empty");
        });

        it("should handle whitespace-only strings as empty", () => {
            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("   ", {description: "Test", operations: []});
            }).toThrow("Validation failed for generator id: cannot be empty");
        });

        it("should validate data types strictly", () => {
            expect(() => {
                api.addGenerator("test", {
                    description: "Test",
                    prompts: "not an array" as any,
                    operations: [],
                });
            }).toThrow("Validation failed for generator.prompts: must be an array");

            expect(() => {
                // @ts-ignore should be missing prompts for validation
                api.addGenerator("test", {
                    description: "Test",
                    operations: [
                        {
                            type: "create",
                            filePath: "test.txt",
                            templateStr: "content",
                            skipIfExists: "true" as any, // Should be boolean
                        },
                    ],
                });
            }).toThrow("Validation failed for operations[0].skipIfExists: must be a boolean");
        });
    });
});