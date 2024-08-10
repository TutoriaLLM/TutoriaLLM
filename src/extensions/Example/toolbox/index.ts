import type { extCategory, extLocale } from "extentionContext";

export const category: extCategory = {
	kind: "category",
	name: "%{BKY_EXAMPLE}",
	colour: "#a855f7",
	contents: [
		{
			kind: "block",
			type: "ext_example_console_log",
		},
	],
};

export const locale: extLocale = {
	ja: {
		EXAMPLE: "開発例",
	},
	en: {
		EXAMPLE: "Example",
	},
};
