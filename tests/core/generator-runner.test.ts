import fs from "node:fs/promises";
import Handlebars from "handlebars";
import inquirer from "inquirer";
import { configAPI } from "../../src/config-api";
import { store } from "../../src/config-store";
import { generatorRunner } from "../../src/core/generator-runner";
import { operationDecorators } from "../../src/core/operations/operation-decorators";
import { ops } from "../../src/core/operations/ops";
import { fileSys } from "../../src/utils/file-sys";
import { stringHelpers } from "../../src/utils/helpers/string-transformers";
import { logger } from "../../src/utils/logger";
import { templateAssetRegister } from "../../src/utils/template-asset-register";
import { testData } from "../__fixtures__/test-data";

vi.mock("inquirer");

describe("runGenerator", () => {
	const input = { name: "text input" };

	beforeEach(async () => {
		vi.spyOn(inquirer, "prompt").mockResolvedValueOnce(input);
	});

	it("should prompt user for input when generator configured with prompts", async () => {
		await testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		await generatorRunner.run();

		expect(inquirer.prompt).toHaveBeenCalledWith(testData.component.generator.prompts);
	});

	it("should register built-in helpers and user-configured helpers", async () => {
		await testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		vi.spyOn(templateAssetRegister, "register");
		vi.spyOn(Handlebars, "registerHelper");

		await generatorRunner.run();

		expect(templateAssetRegister.register).toHaveBeenCalled();
		expect(Handlebars.registerHelper).toHaveBeenCalledWith("upperCase", stringHelpers.upperCase);
		expect(Handlebars.registerHelper).toHaveBeenCalledWith("awwYeah", testData.AwwYeahHelper);
	});

	it("should merge input with operation data", async () => {
		await testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		vi.spyOn(ops, "create");

		await generatorRunner.run();

		expect(ops.create).toHaveBeenNthCalledWith(1, operationDecorators.decorate(testData.makeCreateOperation()), {
			...input,
			...testData.themeData,
		});
	});

	it("should call appropriate operation function", async () => {
		await testData.slimConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		vi.spyOn(ops, "create");
		vi.spyOn(ops, "append");
		vi.spyOn(ops, "prepend");

		await generatorRunner.run();

		expect(ops.create).toHaveBeenCalled();
		expect(ops.append).toHaveBeenCalled();
		expect(ops.prepend).toHaveBeenCalled();
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

		vi.spyOn(ops, "create");

		await generatorRunner.run();

		expect(ops.create).not.toHaveBeenCalled();
	});

	it("should throw error when an operation error is caught and haltOnError is true", async () => {
		testData.zeroConfigFunc(configAPI.get());
		store.setGenerator(
			"failOpGen",
			Object.assign(testData.component.generator, {
				operations: [testData.makeCreateAllOperation()],
			}),
		);
		store.setSelectedGenerator("failOpGen");

		vi.spyOn(fileSys, "fileExists").mockResolvedValueOnce(true);
		vi.spyOn(generatorRunner, "run");
		vi.spyOn(ops, "createAll");

		await expect(generatorRunner.run()).rejects.toThrow();

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("Create all operation failed"),
			expect.stringContaining("File already exists"),
		);
		expect(ops.createAll).toHaveBeenCalledWith(operationDecorators.createAll(testData.makeCreateAllOperation()), {
			...input,
			...testData.themeData,
		});
	});

	it("should throw error when an operation error is caught and haltOnError is true, additional check", async () => {
		await testData.fullConfigFunc(configAPI.get());
		store.setGenerator(
			"fail-op-gen",
			Object.assign(testData.component.generator, {
				operations: [
					testData.makeAmendOperation({
						type: "append",
					}),
				],
			}),
		);
		store.setSelectedGenerator("fail-op-gen");

		vi.spyOn(fs, "readFile").mockRejectedValue(new Error("Simulated read error"));
		vi.spyOn(generatorRunner, "run");

		await expect(generatorRunner.run()).rejects.toThrow();

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("Append operation failed"),
			expect.stringContaining("Error reading file"),
		);
	});

	it("should throw error when an operation error is caught and haltOnError is false", async () => {
		testData.zeroConfigFunc(configAPI.get());
		store.setGenerator(
			"noFailGen",
			Object.assign(testData.component.generator, {
				operations: [
					testData.makeCreateOperation({
						haltOnError: false,
					}),
				],
			}),
		);
		store.setSelectedGenerator("noFailGen");

		vi.spyOn(fileSys, "fileExists").mockResolvedValueOnce(true);
		vi.spyOn(generatorRunner, "run");

		await expect(generatorRunner.run()).resolves.toBeUndefined();

		expect(logger.error).toHaveBeenCalledTimes(1);
	});
});
