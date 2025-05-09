import fs from "node:fs/promises";
import { Command } from "commander";
import inquirer from "inquirer";
import { configAPI } from "../../src/config-api";
import { store } from "../../src/config-store";
import { cli } from "../../src/core/client-runner";
import { configLoader } from "../../src/core/config-loader";
import { generatorResolver } from "../../src/core/generator-resolver";
import { generatorRunner } from "../../src/core/generator-runner";
import { logger } from "../../src/utils/logger";
import { testData } from "../__fixtures__/test-data";

describe("runCli", () => {
	describe("mocked core functions", () => {
		beforeEach(() => {
			vi.spyOn(configLoader, "load").mockResolvedValueOnce();
			vi.spyOn(generatorResolver, "resolve").mockResolvedValueOnce();
			vi.spyOn(generatorRunner, "run").mockResolvedValueOnce();
		});

		it("should setup commander and load config", async () => {
			vi.spyOn(Command.prototype, "version");
			vi.spyOn(Command.prototype, "description");
			vi.spyOn(Command.prototype, "parse");

			await cli.run();

			expect(Command.prototype.version).toHaveBeenCalled();
			expect(Command.prototype.description).toHaveBeenCalled();
			expect(Command.prototype.parse).toHaveBeenCalled();
			expect(logger.error).not.toHaveBeenCalled();
		});

		it("should exit process when an error is thrown from core function", async () => {
			vi.spyOn(configLoader, "load").mockRejectedValueOnce(
				new Error("Config file not found. Create one to define your generators, helpers, and other options."),
			);

			await expect(cli.run()).rejects.toThrow('process.exit unexpectedly called with "1"');
			expect(logger.error).toHaveBeenCalledWith(
				"Error: Config file not found. Create one to define your generators, helpers, and other options.",
			);
		});

		it("should use generator arg when provided", async () => {
			vi.spyOn(process, "argv", "get").mockReturnValueOnce(["", "", testData.component.id]);
			vi.spyOn(store, "setSelectedGenerator");

			await cli.run();

			expect(store.setSelectedGenerator).toHaveBeenCalledWith(testData.component.id);
			expect(logger.error).not.toHaveBeenCalled();
		});
	});

	describe("actual generator runner", () => {
		it("should exit process when an error is thrown from operation", async () => {
			await testData.slimConfigFunc(configAPI.get());
			store.setSelectedGenerator(testData.component.id);
			const input = { name: "table cell" };

			vi.spyOn(process, "argv", "get").mockReturnValue(["", "", testData.component.id]);
			vi.spyOn(configLoader, "load").mockImplementationOnce(vi.fn());
			vi.spyOn(generatorResolver, "resolve").mockImplementationOnce(vi.fn());
			vi.spyOn(inquirer, "prompt").mockResolvedValueOnce(input);
			vi.spyOn(fs, "writeFile").mockRejectedValueOnce(new Error("Simulated write error"));

			await expect(cli.run()).rejects.toThrow('process.exit unexpectedly called with "1"');

			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("[CREATE] Operation failed."),
				expect.stringContaining("Error writing file"),
			);
		});
	});
});
