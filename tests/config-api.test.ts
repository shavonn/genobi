import Handlebars from "handlebars";
import type { GeneratorConfig } from "../src";
import { configAPI } from "../src/config-api";
import { store } from "../src/config-store";
import { fileSys } from "../src/utils/file-sys";
import { logger } from "../src/utils/logger";
import { validation } from "../src/utils/validation";

// Mocks must be at top level with factory functions
vi.mock("../src/config-store", () => ({
	store: {
		state: vi.fn(),
		setGenerator: vi.fn(),
		setHelper: vi.fn(),
		setPartial: vi.fn(),
		setOperation: vi.fn(),
		setConfigFilePath: vi.fn(),
		setSelectionPrompt: vi.fn(),
	},
}));
vi.mock("../src/utils/validation", () => ({
	validation: {
		validateGenerator: vi.fn(),
		validateHelper: vi.fn(),
		validatePartial: vi.fn(),
		validatePartialFilePath: vi.fn(),
		validateOperationRegistration: vi.fn(),
	},
}));
vi.mock("../src/utils/file-sys", () => ({
	fileSys: {
		readFromFile: vi.fn(),
	},
}));
vi.mock("handlebars", () => ({
	default: {
		registerHelper: vi.fn(),
	},
}));

describe("configAPI", () => {
	let api: ReturnType<typeof configAPI.get>;
	let mockState: ReturnType<typeof store.state>;

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
			operations: new Map(),
			selectedGenerator: "",
			debugLogging: false,
		};

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

	describe("addOperation", () => {
		const validHandler = () => {};

		it("should add a valid operation", () => {
			vi.mocked(validation.validateOperationRegistration).mockReturnValueOnce();

			api.addOperation("my-operation", validHandler);

			expect(validation.validateOperationRegistration).toHaveBeenCalledWith("my-operation", validHandler);
			expect(store.setOperation).toHaveBeenCalledWith("my-operation", validHandler);
			expect(logger.info).toHaveBeenCalledWith('Operation "my-operation" registered successfully');
		});

		it("should warn when overwriting existing operation", () => {
			mockState.operations.set("existing", validHandler);
			vi.mocked(validation.validateOperationRegistration).mockReturnValueOnce();

			api.addOperation("existing", validHandler);

			expect(logger.warn).toHaveBeenCalledWith('Operation "existing" already exists and will be overwritten');
		});

		it("should log and rethrow validation errors", () => {
			const validationError = new Error("Invalid operation");
			vi.mocked(validation.validateOperationRegistration).mockImplementation(() => {
				throw validationError;
			});

			expect(() => api.addOperation("bad", "not a function" as any)).toThrow(validationError);
			expect(logger.error).toHaveBeenCalledWith('Failed to add operation "bad": Invalid operation');
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
			mockState.operations.set("operation1", () => {});
			mockState.operations.set("operation2", async () => {});
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

		it("should get an operation by name", () => {
			const operation = api.getOperation("operation1");
			expect(operation).toBeDefined();
			expect(typeof operation).toBe("function");
		});

		it("should return undefined for non-existent operation", () => {
			const operation = api.getOperation("non-existent");
			expect(operation).toBeUndefined();
		});

		it("should get all operations", () => {
			const operations = api.getOperations();
			expect(Object.keys(operations)).toEqual(["operation1", "operation2"]);
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
