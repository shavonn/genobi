/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		mockReset: true,
		clearMocks: true,
		setupFiles: ["./tests/setup.ts"],
		include: ["./tests/**/*.test.ts"],
		coverage: {
			provider: "istanbul",
			reporter: ["html"],
			reportsDirectory: "./coverage",
		},
	},
});
