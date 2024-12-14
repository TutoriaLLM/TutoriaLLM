import type { Locale } from "@/types/locale";
import type * as Blockly from "blockly";
import { actions } from "./contents/actions";
import { agent } from "./contents/agent";
import { block } from "./contents/block";
import { playerEvents } from "./contents/playerEvents";
import { position } from "./contents/position";
export const category: Blockly.utils.toolbox.CategoryInfo = {
	kind: "category",
	name: "%{BKY_MINECRAFT}",
	colour: "#a855f7",
	id: undefined,
	categorystyle: undefined,
	cssconfig: undefined,
	hidden: undefined,
	contents: [
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_PLAYER_EVENTS}",
			colour: "#6366f1",
			contents: playerEvents,
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_ACTIONS}",
			colour: "#d97706",
			contents: actions,
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_AGENT}",
			colour: "#f43f5e",
			contents: agent,
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_BLOCK}",
			colour: "#22c55e",
			contents: block,
		},
		{
			kind: "category",
			name: "%{BKY_MINECRAFT_POSITION}",
			colour: "#10b981",
			contents: position,
		},
	],
};

export const locale = {
	ja: {
		MINECRAFT: "マインクラフト",
		MINECRAFT_ACTIONS: "アクション",
		MINECRAFT_PLAYER_EVENTS: "プレイヤー",
		MINECRAFT_AGENT: "エージェント",
		MINECRAFT_BLOCK: "ブロック",
		MINECRAFT_ITEM: "アイテム",
		MINECRAFT_POSITION: "座標",
	},
	en: {
		MINECRAFT: "Minecraft",
		MINECRAFT_ACTIONS: "Actions",
		MINECRAFT_PLAYER_EVENTS: "Player",
		MINECRAFT_AGENT: "Agent",
		MINECRAFT_BLOCK: "Block",
		MINECRAFT_ITEM: "Item",
		MINECRAFT_POSITION: "Position",
	},
} satisfies Locale;
