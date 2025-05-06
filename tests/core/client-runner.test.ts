import { Command } from "commander";
import { cli } from "../../src/core/client-runner";
import { configLoader } from "../../src/core/config-loader";
import { logger } from "../../src/utils/logger";

describe("run", () => {
	beforeEach(() => {
		vi.spyOn(configLoader, "load").mockResolvedValueOnce();
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
});
