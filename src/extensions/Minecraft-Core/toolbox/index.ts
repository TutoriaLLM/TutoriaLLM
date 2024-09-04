export const category = {
	kind: "category",
	name: "%{BKY_MINECRAFT}",
	colour: "#a855f7",
	contents: [
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_PLAYER_EVENTS}",
			colour: "#a855f7",
			contents: [
				{
					kind: "block",
					type: "ext_minecraft_onplayerchatcommand",
				},
				{
					kind: "block",
					type: "ext_minecraft_onminecraftconnection",
				},
				{
					kind: "block",
					type: "ext_minecraft_onplayertransform",
				},
			],
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_ACTIONS}",
			colour: "#a855f7",
			contents: [
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
				{
					kind: "block",
					type: "ext_minecraft_TeleportAgentToPlayer",
				},
				{
					kind: "block",
					type: "ext_minecraft_createAgent",
				},
			],
		},
	],
};

export const locale = {
	ja: {
		MINECRAFT: "マインクラフト",
		MINECRAFT_ACTIONS: "アクション",
		MINECRAFT_PLAYER_EVENTS: "プレイヤー",
	},
	en: {
		MINECRAFT: "Minecraft",
		MINECRAFT_ACTIONS: "Actions",
		MINECRAFT_PLAYER_EVENTS: "Player",
	},
};
