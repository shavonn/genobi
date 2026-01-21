#!/usr/bin/env node

import { cli } from "../src/core/client-runner";

(async () => {
  await cli.run();
})();
