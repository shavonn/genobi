import "./__mocks__/process-mock";
import "./__mocks__/chalk-mock";
import * as process from "node:process";
import { store } from "../src/config-store";
import { cleanUpTmpDir, createTmpDir, getTmpDir } from "./test-utils";

vi.mock("../src/utils/logger", { spy: true });

beforeEach(async () => {
	store.resetDefault();
	await createTmpDir();

	const dir = getTmpDir();
	store.setDestinationBasePath(dir);
	vi.spyOn(process, "cwd").mockReturnValue(dir);
});

afterEach(async () => {
	await cleanUpTmpDir();
});
