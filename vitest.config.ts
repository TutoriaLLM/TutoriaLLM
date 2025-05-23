import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	test: {
		exclude: [
			//default exclude
			"**/node_modules/**",
			"**/dist/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
			// exclude e2e tests(playwright)
			"**/e2e/**",
		],
		coverage: {
			reporter: ["text", "json-summary", "json"],
		},
	},

	plugins: [tsconfigPaths(), react()],
});
