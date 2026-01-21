import { logger } from "../../src/utils/logger";
import { getTmpDirPath } from "../test-utils";

vi.mock("glob", async () => {
  const original = await vi.importActual<typeof import("glob")>("glob");
  return {
    ...original,
    default: {
      ...original,
      globSync: (pattern: string, options: any = {}) => {
        logger.debug("--globSync", getTmpDirPath(pattern));
        return original.globSync(pattern, options);
      },
    },
  };
});
