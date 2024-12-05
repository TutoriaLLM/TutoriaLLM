export const category = {
	kind: "category",
	name: "%{BKY_SERVER}",
	colour: "#57534e",
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
} satisfies globalThis.locale;
