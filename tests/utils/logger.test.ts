import chalk from "chalk";
import { store } from "../../src/config-store";
import { logger } from "../../src/utils/logger";

describe("logger", () => {
	describe("logDebug", () => {
		it("should log to console via console.debug when debug logging enabled", () => {
			store.enableDebugLogging();

			vi.spyOn(console, "debug");

			logger.debug("You sit on a throne of lies.", { movie: "Elf" });

			expect(chalk.cyanBright).toHaveBeenCalledWith("[Debug]");
			expect(console.debug).toHaveBeenCalledWith("[Debug]", "You sit on a throne of lies.", { movie: "Elf" });
		});

		it("should not log to console when debug logging disabled", () => {
			vi.spyOn(console, "debug");

			logger.debug("Adventure is out there.", { movie: "Up" });

			expect(chalk.cyanBright).not.toHaveBeenCalled();
			expect(console.debug).not.toHaveBeenCalled();
		});
	});

	describe("logError", () => {
		it("should log to console via console.error", () => {
			vi.spyOn(console, "error");

			logger.error("I like them French-fried potaters.", { movie: "Sling Blade" });

			expect(chalk.red).toHaveBeenCalledWith("I like them French-fried potaters.");
			expect(console.error).toHaveBeenCalledWith("I like them French-fried potaters.", { movie: "Sling Blade" });
		});
	});

	describe("logInfo", () => {
		it("should log to console via console.info when verbose logging enabled", () => {
			store.enableVerboseLogging();

			vi.spyOn(console, "info");

			logger.info("Just keep swimming", { movie: "Sunset Boulevard" });

			expect(chalk.blue).toHaveBeenCalledWith("Just keep swimming");
			expect(console.info).toHaveBeenCalledWith("Just keep swimming", { movie: "Sunset Boulevard" });
		});

		it("should not log to console when verbose logging disabled", () => {
			vi.spyOn(console, "info");

			logger.info("Why so serious?", { movie: "The Dark Knight" });

			expect(chalk.blue).not.toHaveBeenCalled();
			expect(console.info).not.toHaveBeenCalled();
		});
	});

	describe("logWarn", () => {
		it("should log to console via console.warn", () => {
			vi.spyOn(console, "warn");

			logger.warn("If you're a bird, I'm a bird.", { movie: "The Notebook" });

			expect(chalk.yellow).toHaveBeenCalledWith("If you're a bird, I'm a bird.");
			expect(console.warn).toHaveBeenCalledWith("If you're a bird, I'm a bird.", { movie: "The Notebook" });
		});
	});

	describe("logSuccess", () => {
		it("should log to console via console.log", () => {
			vi.spyOn(console, "log");

			logger.success("That'll do, pig. That'll do.", { movie: "Babe" });

			expect(chalk.green).toHaveBeenCalledWith("That'll do, pig. That'll do.");
			expect(console.log).toHaveBeenCalledWith("That'll do, pig. That'll do.", { movie: "Babe" });
		});
	});
});
