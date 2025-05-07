import path from "node:path";
import { store } from "../src/config-store";
import { testData } from "./__fixtures__/test-data";
import { cleanUpTmpDir, createTmpDir, getTmpDir } from "./test-utils";

beforeEach(async () => {
	store.resetDefault();
	await createTmpDir();

	const dir = getTmpDir();
	store.setDestinationBasePath(dir);
	store.setConfigFilePath(path.resolve(dir, testData.configFilePath));
});

afterEach(async () => {
	await cleanUpTmpDir();
});
