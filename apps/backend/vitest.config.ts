import { defineProject, mergeConfig } from "vitest/config";
import configShared from "../../vitest.config";
import dotenv from "dotenv";
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
			env: dotenv.config({ path: `${__dirname}/.env.test` }).parsed,
		},
		resolve: {
			alias: {
				"@": `${__dirname}/src`,
			},
		},
	}),
);
