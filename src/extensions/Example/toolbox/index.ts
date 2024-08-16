import type { extCategory, extLocale } from "extentionContext";

export const category: extCategory = {
	kind: "category",
	name: "%{BKY_SERVER}",
	colour: "#57534e",
	contents: [
		{
			kind: "block",
			type: "ext_example_console_log",
		},
	],
};

export const locale: extLocale = {
	ja: {
		SERVER: "サーバー",
	},
	en: {
		SERVER: "Server",
	},
};
