import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    entry: ["src/index.ts", "bin/cli.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    format: ["cjs", "esm"],
    dts: true,
    ...options,
  };
});
