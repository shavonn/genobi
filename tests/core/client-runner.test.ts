import { Command } from "commander";
import { store } from "../../src/config-store";
import { cli } from "../../src/core/client-runner";
import { configLoader } from "../../src/core/config-loader";
import { generatorResolver } from "../../src/core/generator-resolver";
import { generatorRunner } from "../../src/core/generator-runner";
import { logger } from "../../src/utils/logger";
import { testData } from "../__fixtures__/test-data";

describe("run", () => {
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

	it("should exit process when an error is thrown", async () => {
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
