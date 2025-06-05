import Handlebars from "handlebars";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratorConfig } from "../src";
import { configAPI } from "../src/config-api";
import { store } from "../src/config-store";
import { fileSys } from "../src/utils/file-sys";
import { logger } from "../src/utils/logger";
import { validation } from "../src/utils/validation";

describe("configAPI", () => {
	let api: ReturnType<typeof configAPI.get>;
	let mockState: any;

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();

		// Setup mock state
		mockState = {
			configFilePath: "/test/config.js",
			configPath: "/test",
			destinationBasePath: "/test",
			selectionPrompt: "Select a generator:",
			generators: new Map(),
			helpers: new Map(),
			partials: new Map(),
		};

		vi.mock("../src/config-store");
		vi.mock("../src/utils/validation");
		vi.mock("../src/utils/file-sys");

		// Mock store methods
		vi.mocked(store.state).mockReturnValue(mockState);

		// Get fresh API instance
		api = configAPI.get();
	});

	afterAll(() => {
		vi.resetAllMocks();
		vi.clearAllMocks();
	});

	describe("addGenerator", () => {
		const validGenerator: GeneratorConfig = {
			description: "Test generator",
			prompts: [],
			operations: [
				{
					type: "create",
					filePath: "test.txt",
					templateStr: "content",
				},
			],
		};

		it("should add a valid generator", () => {
			vi.mocked(validation.validateGenerator).mockReturnValueOnce();

			api.addGenerator("test-gen", validGenerator);

			expect(validation.validateGenerator).toHaveBeenCalledWith("test-gen", validGenerator);
			expect(store.setGenerator).toHaveBeenCalledWith("test-gen", validGenerator);
			expect(logger.info).toHaveBeenCalledWith('Generator "test-gen" registered successfully');
		});

		it("should warn when overwriting existing generator", () => {
			mockState.generators.set("existing", validGenerator);
			vi.mocked(validation.validateGenerator).mockReturnValueOnce();

			api.addGenerator("existing", validGenerator);

			expect(logger.warn).toHaveBeenCalledWith('Generator "existing" already exists and will be overwritten');
		});

		it("should log and rethrow validation errors", () => {
			const validationError = new Error("Validation failed");
			vi.mocked(validation.validateGenerator).mockImplementation(() => {
				throw validationError;
			});

			expect(() => api.addGenerator("bad-gen", {} as any)).toThrow(validationError);
			expect(logger.error).toHaveBeenCalledWith('Failed to add generator "bad-gen": Validation failed');
		});
	});

	describe("addHelper", () => {
		const validHelper = (str: string) => str.toUpperCase();

		it("should add a valid helper", () => {
			vi.mock("handlebars");
			vi.mocked(validation.validateHelper).mockReturnValueOnce();

			api.addHelper("uppercase", validHelper);

			expect(validation.validateHelper).toHaveBeenCalledWith("uppercase", validHelper);
			expect(store.setHelper).toHaveBeenCalledWith("uppercase", validHelper);
			expect(Handlebars.registerHelper).toHaveBeenCalledWith("uppercase", validHelper);
			expect(logger.info).toHaveBeenCalledWith('Helper "uppercase" registered successfully');
		});

		it("should warn when overwriting existing helper", () => {
			mockState.helpers.set("existing", validHelper);
			vi.mocked(validation.validateHelper).mockReturnValueOnce();

			api.addHelper("existing", validHelper);

			expect(logger.warn).toHaveBeenCalledWith('Helper "existing" already exists and will be overwritten');
		});

		it("should log and rethrow validation errors", () => {
			const validationError = new Error("Invalid helper");
			vi.mocked(validation.validateHelper).mockImplementation(() => {
				throw validationError;
			});

			expect(() => api.addHelper("bad", "not a function" as any)).toThrow(validationError);
			expect(logger.error).toHaveBeenCalledWith('Failed to add helper "bad": Invalid helper');
		});
	});

	describe("addPartial", () => {
		const validPartial = "<div>{{content}}</div>";

		it("should add a valid partial", () => {
			vi.mocked(validation.validatePartial).mockReturnValueOnce();

			api.addPartial("testPartial", validPartial);

			expect(validation.validatePartial).toHaveBeenCalledWith("testPartial", validPartial);
			expect(store.setPartial).toHaveBeenCalledWith("testPartial", validPartial);
			expect(logger.info).toHaveBeenCalledWith('Partial "testPartial" registered successfully');
		});

		it("should warn when overwriting existing partial", () => {
			mockState.partials.set("existing", validPartial);
			vi.mocked(validation.validatePartial).mockReturnValueOnce();

			api.addPartial("existing", validPartial);

			expect(logger.warn).toHaveBeenCalledWith('Partial "existing" already exists and will be overwritten');
		});

		it("should log and rethrow validation errors", () => {
			const validationError = new Error("Invalid partial");
			vi.mocked(validation.validatePartial).mockImplementation(() => {
				throw validationError;
			});

			expect(() => api.addPartial("bad", 123 as any)).toThrow(validationError);
			expect(logger.error).toHaveBeenCalledWith('Failed to add partial "bad": Invalid partial');
		});
	});

	describe("addPartialFromFile", () => {
		const partialContent = "<header>{{title}}</header>";

		it("should add a partial from file", async () => {
			vi.mocked(validation.validatePartialFilePath).mockReturnValueOnce();
			vi.mocked(fileSys.readFromFile).mockResolvedValueOnce(partialContent);

			await api.addPartialFromFile("header", "partials/header.hbs");

			expect(validation.validatePartialFilePath).toHaveBeenCalledWith("header", "partials/header.hbs");
			expect(fileSys.readFromFile).toHaveBeenCalledWith("/test/partials/header.hbs");
			expect(store.setPartial).toHaveBeenCalledWith("header", partialContent);
			expect(logger.info).toHaveBeenCalledWith("Reading partial from file: /test/partials/header.hbs");
			expect(logger.info).toHaveBeenCalledWith('Partial "header" loaded from file successfully');
		});

		it("should warn when overwriting existing partial", async () => {
			mockState.partials.set("existing", "<div>old</div>");
			vi.mocked(validation.validatePartialFilePath).mockReturnValueOnce();
			vi.mocked(fileSys.readFromFile).mockResolvedValueOnce(partialContent);

			await api.addPartialFromFile("existing", "partials/new.hbs");

			expect(logger.warn).toHaveBeenCalledWith('Partial "existing" already exists and will be overwritten');
		});

		it("should log and rethrow validation errors", async () => {
			const validationError = new Error("Invalid file path");
			vi.mocked(validation.validatePartialFilePath).mockImplementation(() => {
				throw validationError;
			});

			await expect(api.addPartialFromFile("bad", "")).rejects.toThrow(validationError);
			expect(logger.error).toHaveBeenCalledWith('Failed to add partial "bad" from file: Invalid file path');
		});

		it("should log and rethrow file read errors", async () => {
			const readError = new Error("File not found");
			vi.mocked(validation.validatePartialFilePath).mockReturnValueOnce();
			vi.mocked(fileSys.readFromFile).mockRejectedValueOnce(readError);

			await expect(api.addPartialFromFile("missing", "not-found.hbs")).rejects.toThrow(readError);
			expect(logger.error).toHaveBeenCalledWith('Failed to add partial "missing" from file: File not found');
		});
	});

	describe("getter methods", () => {
		beforeEach(() => {
			// Add some test data
			mockState.generators.set("gen1", { description: "Generator 1", prompts: [], operations: [] });
			mockState.generators.set("gen2", { description: "Generator 2", prompts: [], operations: [] });
			mockState.helpers.set("helper1", () => "test");
			mockState.helpers.set("helper2", () => "test2");
			mockState.partials.set("partial1", "<div>1</div>");
			mockState.partials.set("partial2", "<div>2</div>");
		});

		it("should get config file path", () => {
			expect(api.getConfigFilePath()).toBe("/test/config.js");
		});

		it("should get destination base path", () => {
			expect(api.getDestinationBasePath()).toBe("/test");
		});

		it("should get selection prompt", () => {
			expect(api.getSelectionPrompt()).toBe("Select a generator:");
		});

		it("should get a generator by ID", () => {
			const generator = api.getGenerator("gen1");
			expect(generator).toEqual({ description: "Generator 1", prompts: [], operations: [] });
		});

		it("should throw when getting non-existent generator", () => {
			expect(() => api.getGenerator("non-existent")).toThrow(
				'Generator "non-existent" not found in loaded configuration.',
			);
		});

		it("should get all generators", () => {
			const generators = api.getGenerators();
			expect(generators).toEqual({
				gen1: { description: "Generator 1", prompts: [], operations: [] },
				gen2: { description: "Generator 2", prompts: [], operations: [] },
			});
		});

		it("should get a helper by name", () => {
			const helper = api.getHelper("helper1");
			expect(helper).toBeDefined();
			expect(helper()).toBe("test");
		});

		it("should throw when getting non-existent helper", () => {
			expect(() => api.getHelper("non-existent")).toThrow('Helper "non-existent" not found in loaded configuration.');
		});

		it("should get all helpers", () => {
			const helpers = api.getHelpers();
			expect(Object.keys(helpers)).toEqual(["helper1", "helper2"]);
		});

		it("should get a partial by name", () => {
			const partial = api.getPartial("partial1");
			expect(partial).toBe("<div>1</div>");
		});

		it("should throw when getting non-existent partial", () => {
			expect(() => api.getPartial("non-existent")).toThrow(
				'Template partial "non-existent" not found in loaded configuration.',
			);
		});

		it("should get all partials", () => {
			const partials = api.getPartials();
			expect(partials).toEqual({
				partial1: "<div>1</div>",
				partial2: "<div>2</div>",
			});
		});
	});

	describe("setter methods", () => {
		it("should set config file path", () => {
			api.setConfigFilePath("/new/path/config.js");
			expect(store.setConfigFilePath).toHaveBeenCalledWith("/new/path/config.js");
		});

		it("should set selection prompt", () => {
			api.setSelectionPrompt("Choose your generator:");
			expect(store.setSelectionPrompt).toHaveBeenCalledWith("Choose your generator:");
		});
	});
});
