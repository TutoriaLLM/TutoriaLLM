import type { KnipConfig } from "knip";

const config: KnipConfig = {
	ignoreBinaries: ["only-allow", "type:check"],
	workspaces: {
		"apps/backend": {
			ignore: [
				"src/hc.ts",
				"src/libs/errors/object.ts",
				"drizzle.studio.config.ts",
				"worker.mjs",
				"src/modules/vm/worker.mjs",
			],
			includeEntryExports: true,
		},
		"apps/frontend": {
			ignore: ["src/components/ui/**", "src/routeTree.gen.ts"],
		},
		"packages/extensions": {},
	},
};

export default config;
