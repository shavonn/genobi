import { Command } from "commander";
import { cli } from "../../src/core/client-runner";
import { logger } from "../../src/utils/logger";

describe("run", () => {
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
});
