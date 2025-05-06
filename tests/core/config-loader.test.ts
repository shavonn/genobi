import { type PublicExplorer, cosmiconfig } from "cosmiconfig";
import { store } from "../../src/config-store";
import { configLoader } from "../../src/core/config-loader";
import { logger } from "../../src/utils/logger";
import { testData } from "../__fixtures__/test-data";

vi.mock("cosmiconfig");

describe("loadConfig", () => {
	it("should load config file and apply to config", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: false,
					config: testData.fullConfigFunc,
					filepath: testData.configFilePath,
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
					filepath: testData.configFilePath,
				});
			},
		} as PublicExplorer);

		await expect(configLoader.load()).rejects.toThrow(
			`Config file invalid. It must export a default function: ${testData.configFilePath}.`,
		);
	});

	it("should throw error when no generators are configured", async () => {
		vi.mocked(cosmiconfig).mockReturnValueOnce({
			search: () => {
				return Promise.resolve({
					isEmpty: false,
					config: testData.zeroConfigFunc,
					filepath: testData.configFilePath,
				});
			},
		} as PublicExplorer);

		await expect(configLoader.load()).rejects.toThrow(
			"No generators were found in the loaded configuration. Please define at least one generator.",
		);
	});
});
