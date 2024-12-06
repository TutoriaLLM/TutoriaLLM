import type { Locale } from "@/types/locale";
import type * as Blockly from "blockly";
export const category: Blockly.utils.toolbox.CategoryInfo = {
	kind: "category",
	name: "%{BKY_SERVER}",
	colour: "#57534e",
	id: undefined,
	categorystyle: undefined,
	cssconfig: undefined,
	hidden: undefined,
	contents: [
		{
			kind: "block",
			type: "ext_server_log",
			//shadowの設定
			inputs: {
				INPUT: {
					shadow: {
						type: "text",
						fields: {
							TEXT: "Hello, Server!",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "ext_server_onServerStart",
		},
	],
};

export const locale = {
	ja: {
		SERVER: "サーバー",
	},
	en: {
		SERVER: "Server",
	},
} satisfies Locale;
