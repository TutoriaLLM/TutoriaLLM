export const category = {
	kind: "category",
	name: "%{BKY_MINECRAFT}",
	colour: "#a855f7",
	contents: [
		{
			kind: "block",
			type: "ext_minecraft_onplayerchatcommand",
		},
		{
			kind: "block",
			type: "ext_minecraft_onplayertransform",
		},
		{
			kind: "block",
			type: "ext_minecraft_sendcommandrequest",
		},
		{
			kind: "block",
			type: "ext_minecraft_sendMsg",
		},
		{
			kind: "block",
			type: "ext_minecraft_debugmessage",
		},
	],
};

export const locale = {
	ja: {
		MINECRAFT: "マインクラフト",
	},
	en: {
		MINECRAFT: "Minecraft",
	},
};
