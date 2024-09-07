import playerEvents from "./contents/playerEvents.json";
import actions from "./contents/actions.json";
import agent from "./contents/agent.json";
export const category = {
	kind: "category",
	name: "%{BKY_MINECRAFT}",
	colour: "#a855f7",
	contents: [
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_PLAYER_EVENTS}",
			colour: "#a855f7",
			contents: playerEvents,
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_ACTIONS}",
			colour: "#a855f7",
			contents: actions,
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_AGENT}",
			colour: "#a855f7",
			contents: agent,
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
