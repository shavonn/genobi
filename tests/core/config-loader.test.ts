import { type PublicExplorer, cosmiconfig } from "cosmiconfig";
import type { ConfigAPI } from "../../src";
import { store } from "../../src/config-store";
import { cli } from "../../src/core/client-runner";
import { configLoader } from "../../src/core/config-loader";
import { logger } from "../../src/utils/logger";
import { testData } from "../__fixtures__/test-data";
import { getTmpDirPath } from "../test-utils";

vi.mock("cosmiconfig");

describe("loadConfig", () => {
	it("should load config file and apply to config", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: false,
					config: testData.fullConfigFunc,
					filepath: getTmpDirPath(testData.configFilePath),
				});
			},
		} as PublicExplorer);

		await configLoader.load();

		expect(store.state().selectionPrompt).toBe(testData.selectionPrompt);
		expect(store.state().generators.get(testData.component.id)).toBe(testData.component.generator);
		expect(logger.error).not.toHaveBeenCalled();
	});

	it("should throw error when config file not found", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve(null);
			},
		} as PublicExplorer);

		await expect(configLoader.load()).rejects.toThrow(
			"Config file not found. Create one to define your generators, helpers, and other options.",
		);
	});

	it("should throw error when config file invalid", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: true,
					config: "",
					filepath: getTmpDirPath(testData.configFilePath),
				});
			},
		} as PublicExplorer);

		await expect(configLoader.load()).rejects.toThrow(
			`Config file invalid. It must export a default function: ${getTmpDirPath(testData.configFilePath)}.`,
		);
	});

	it("should throw error when no generators are configured", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: false,
					config: testData.zeroConfigFunc,
					filepath: getTmpDirPath(testData.configFilePath),
				});
			},
		} as PublicExplorer);

		await expect(configLoader.load()).rejects.toThrow(
			"No generators were found in the loaded configuration. Please define at least one generator.",
		);
	});

	it("should throw error when an error occurs in a config api func", async () => {
		const configFunc = (genobi: ConfigAPI) => {
			return genobi.addPartialFromFile("newPartial", "templates/partials/new-partial.hbs");
		};
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: false,
					config: configFunc,
					filepath: getTmpDirPath(testData.configFilePath),
				});
			},
		} as PublicExplorer);

		await expect(configLoader.load()).rejects.toThrow();
	});

	it("should handle errors from config loader in the client runner", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: false,
					config: () => {
						throw new Error("Simulated error in config function");
					},
					filepath: getTmpDirPath(testData.configFilePath),
				});
			},
		} as PublicExplorer);

		await expect(cli.run()).rejects.toThrow('process.exit unexpectedly called with "1"');

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("Error: Error in config loading. Simulated error in config function"),
		);
		expect(process.exit).toHaveBeenCalledWith(1);
	});
});
