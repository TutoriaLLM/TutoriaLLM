import { defineProject, mergeConfig } from "vitest/config";
import configShared from "../../vitest.config";

export default mergeConfig(
	configShared,
	defineProject({
		test: {
			globals: true,
			mockReset: true,
			restoreMocks: true,
			clearMocks: true,
			globalSetup: "./tests/vitest.setup.ts",
			environment: "node",
		},
		resolve: {
			alias: {
				"@": `${__dirname}/src`,
			},
		},
	}),
);
