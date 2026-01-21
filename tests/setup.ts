import "./__mocks__/chalk-mock";
import "./__mocks__/process-mock";
import "./__mocks__/glob-mock";

vi.mock("../src/utils/logger", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../src/utils/logger")>();
	return {
		logger: {
			info: vi.fn(actual.logger.info),
			error: vi.fn(actual.logger.error),
			debug: vi.fn(actual.logger.debug),
			success: vi.fn(actual.logger.success),
			warn: vi.fn(actual.logger.warn),
		},
	};
});
