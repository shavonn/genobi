import { getTmpDir } from "../test-utils";

vi.mock("process", { spy: true });

vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit unexpectedly called with "${code}"`);
});

beforeEach(async () => {
  vi.spyOn(process, "cwd").mockReturnValue(getTmpDir());
});
