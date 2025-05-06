import inquirer from "inquirer";
import { configAPI } from "../../src/config-api";
import { store } from "../../src/config-store";
import { generatorResolver } from "../../src/core/generator-resolver";
import { logger } from "../../src/utils/logger";
import { testData } from "../__fixtures__/test-data";

describe("resolveGenerator", () => {
	it("should use generator ID arg when provided", async () => {
		testData.fullConfigFunc(configAPI.get());
		store.setSelectedGenerator(testData.component.id);

		vi.spyOn(store, "setSelectedGenerator");

		await generatorResolver.resolve();

		expect(store.state().selectionPrompt).toBe(testData.selectionPrompt);
		expect(store.setSelectedGenerator).not.toHaveBeenCalled();
	});

	it("should use default prompt text for generator selection when custom not configured", async () => {
		configAPI.get().addGenerator(testData.component.id, testData.component.generator);

		vi.spyOn(inquirer, "prompt").mockResolvedValueOnce(vi.fn());

		await generatorResolver.resolve();

		expect(inquirer.prompt).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					type: "list",
					name: "generator",
					message: "Select from available generators:",
					choices: store.getGeneratorsList(),
				}),
			]),
		);
	});

	it("should use custom select prompt when configured", async () => {
		store.setSelectionPrompt(testData.selectionPrompt);

		vi.spyOn(inquirer, "prompt").mockResolvedValueOnce(vi.fn());

		await generatorResolver.resolve();

		expect(inquirer.prompt).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					type: "list",
					name: "generator",
					message: testData.selectionPrompt,
					choices: store.getGeneratorsList(),
				}),
			]),
		);
	});

	it("should prompt for generator selection when selected generator not found", async () => {
		const missingGen = "missing-gen";
		store.setSelectedGenerator(missingGen);

		vi.spyOn(inquirer, "prompt").mockResolvedValueOnce(vi.fn());
		vi.spyOn(store.state().generators, "has");

		await generatorResolver.resolve();

		expect(store.state().generators.has).toHaveReturnedWith(false);
		expect(logger.error).toHaveBeenCalledWith(`Generator with ID "${missingGen}" not found.`);
		expect(inquirer.prompt).toHaveBeenCalledWith([
			{
				type: "list",
				name: "generator",
				message: store.state().selectionPrompt,
				choices: store.getGeneratorsList(),
			},
		]);
	});
});
