import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	test: {
		environment: "jsdom",
	},
	plugins: [tsconfigPaths(), react()],
});
