import Handlebars from "handlebars";
import inquirer from "inquirer";
import { expect } from "vitest";
import { configAPI } from "../../src/config-api";
import { store } from "../../src/config-store";
import { generatorRunner } from "../../src/core/generator-runner";
import { operations } from "../../src/core/operations";
import { helperRegister } from "../../src/utils/helpers/helper-register";
import { stringHelpers } from "../../src/utils/helpers/string-transformers";
import { testData } from "../__fixtures__/test-data";

vi.mock("inquirer");

describe("runGenerator", () => {
	const input = { name: "text input" };

	beforeEach(() => {
		vi.spyOn(operations, "create").mockResolvedValueOnce();
		vi.spyOn(inquirer, "prompt").mockResolvedValueOnce(input);
	});

	it("should prompt user for input when generator configured with prompts", async () => {
		testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		await generatorRunner.run();

		expect(inquirer.prompt).toHaveBeenCalledWith(testData.component.generator.prompts);
	});

	it("should register built-in helpers and user-configured helpers", async () => {
		testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		vi.spyOn(helperRegister, "register");
		vi.spyOn(Handlebars, "registerHelper");

		await generatorRunner.run();

		expect(helperRegister.register).toHaveBeenCalled();
		expect(Handlebars.registerHelper).toHaveBeenCalledWith("upperCase", stringHelpers.upperCase);
	});

	it("should merge input with operation data", async () => {
		testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		await generatorRunner.run();

		expect(operations.create).toHaveBeenNthCalledWith(1, testData.makeCreateOperation(), {
			...input,
			...testData.themeData,
		});
	});

	it("should execute operations from generator config by type", async () => {
		testData.fullConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		await generatorRunner.run();

		expect(operations.create).toHaveBeenCalled();
	});

	it("should throw error when no operations are found in generator config", async () => {
		testData.zeroConfigFunc(configAPI.get());
		store.setSelectedGenerator("no-op-component");
		store.setGenerator("no-op-component", testData.component.generatorNoOps);

		await expect(generatorRunner.run()).rejects.toThrow(`No operations found for ${store.state().selectedGenerator}`);
	});

	it("should skip when provided function resolves to a truthy value", async () => {
		testData.zeroConfigFunc(configAPI.get());
		store.setSelectedGenerator("skipOpGen");
		store.setGenerator(
			"skipOpGen",
			Object.assign(testData.component.generator, {
				operations: [
					testData.makeCreateOperation({
						skip: () => true,
					}),
				],
			}),
		);

		vi.spyOn(operations, "create");

		await generatorRunner.run();

		expect(operations.create).not.toHaveBeenCalled();
	});
});
