import Handlebars from "handlebars";
import { configAPI } from "../src/config-api";
import { store } from "../src/config-store";
import { testData } from "./__fixtures__/test-data";

describe("config api", () => {
	describe("config file path", () => {
		it("should apply custom select generator prompt", () => {
			configAPI.get().setConfigFilePath("/beep/boop/toot");

			expect(configAPI.get().getConfigFilePath()).toBe("/beep/boop/toot");
		});
	});

	describe("destination base path", () => {
		it("should apply custom select generator prompt", () => {
			expect(configAPI.get().getDestinationBasePath()).toBe(store.state().destinationBasePath);
		});
	});

	describe("select generator prompt", () => {
		it("should apply custom select generator prompt", () => {
			configAPI.get().setSelectionPrompt("hellooo! please select a repository generator.");

			expect(configAPI.get().getSelectionPrompt()).toBe("hellooo! please select a repository generator.");
		});
	});

	describe("generators", () => {
		beforeEach(() => {
			store.resetDefault();
		});

		it("should add generator", () => {
			configAPI.get().addGenerator(testData.component.id, testData.component.generator);

			expect(configAPI.get().getGenerators()).toStrictEqual(
				expect.objectContaining({
					"react-component": testData.component.generator,
				}),
			);
		});

		it("should return specified generator", () => {
			configAPI.get().addGenerator(testData.layout.id, testData.layout.generator);

			expect(configAPI.get().getGenerator("next-layout")).toBe(testData.layout.generator);
		});

		it("should throw error when specified generator not configured", () => {
			expect(() => configAPI.get().getGenerator("missing-gen")).toThrow(
				`Generator "missing-gen" not found in loaded configuration.`,
			);
		});

		it("should get all generators", () => {
			configAPI.get().addGenerator(testData.component.id, testData.component.generator);
			configAPI.get().addGenerator("content-eloquent", {
				description: "Content Type Eloquent Model",
				operations: [],
				prompts: [],
			});

			expect(configAPI.get().getGenerators()).toStrictEqual({
				"react-component": testData.component.generator,
				"content-eloquent": {
					description: "Content Type Eloquent Model",
					operations: [],
					prompts: [],
				},
			});
		});
	});

	describe("helpers", () => {
		it("should add helper", () => {
			vi.spyOn(Handlebars, "registerHelper");

			configAPI.get().addHelper("awwYeah", testData.AwwYeahHelper);

			expect(configAPI.get().getHelpers()).toStrictEqual(
				expect.objectContaining({
					awwYeah: expect.any(Function),
				}),
			);
		});

		it("should return specified helper", () => {
			configAPI.get().addHelper("micDrop", testData.MicDropHelper);

			expect(configAPI.get().getHelper("micDrop")).toBe(testData.MicDropHelper);
		});

		it("should throw error when specified helper not configured", () => {
			expect(() => configAPI.get().getHelper("not-there-helper")).toThrow(
				`Helper "not-there-helper" not found in loaded configuration.`,
			);
		});

		it("should get all helpers", () => {
			configAPI.get().addHelper("micDropHelper", testData.MicDropHelper);
			configAPI.get().addHelper("awwYeah", testData.AwwYeahHelper);

			expect(configAPI.get().getHelpers()).toStrictEqual({
				micDropHelper: testData.MicDropHelper,
				awwYeah: testData.AwwYeahHelper,
			});
		});
	});
});
