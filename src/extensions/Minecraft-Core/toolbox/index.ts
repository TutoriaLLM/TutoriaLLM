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
				{
					kind: "block",
					type: "ext_minecraft_var_PlayerXPos",
				},
				{
					kind: "block",
					type: "ext_minecraft_var_PlayerYPos",
				},
				{
					kind: "block",
					type: "ext_minecraft_var_PlayerZPos",
				},
				{
					kind: "block",
					type: "ext_minecraft_isPlayerUnderWater",
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
					type: "ext_minecraft_summon_mob",
				},
				{
					kind: "block",
					type: "ext_minecraft_summon_monster",
				},
			],
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_AGENT}",
			colour: "#a855f7",
			contents: [
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
		MINECRAFT_AGENT: "エージェント",
	},
	en: {
		MINECRAFT: "Minecraft",
		MINECRAFT_ACTIONS: "Actions",
		MINECRAFT_PLAYER_EVENTS: "Player",
		MINECRAFT_AGENT: "Agent",
	},
};
