import "./__mocks__/chalk-mock";
import "./__mocks__/process-mock";
import "./__mocks__/glob-mock";

vi.mock("../src/utils/logger", { spy: true });
