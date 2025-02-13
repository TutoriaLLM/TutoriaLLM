import { defineProject, mergeConfig } from "vitest/config";
import configShared from "../../vitest.config";

export default mergeConfig(
	configShared,
	defineProject({
		test: {
			environment: "jsdom",
			setupFiles: ["./tests/vitest.setup.ts"],
		},
		resolve: {
			alias: {
				"@": `${__dirname}/src`,
			},
		},
	}),
);
