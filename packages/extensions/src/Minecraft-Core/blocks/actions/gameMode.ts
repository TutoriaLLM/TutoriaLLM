import { Order, javascriptGenerator } from "blockly/javascript";
export const block = {
	type: "ext_minecraft_change_game_mode",
	message0: "%{BKY_MINECRAFT_CHANGE_GAME_MODE}",
	args0: [
		{
			type: "field_dropdown",
			name: "GAME_MODE",
			options: [
				["%{BKY_SURVIVAL}", "survival"],
				["%{BKY_CREATIVE}", "creative"],
				["%{BKY_ADVENTURE}", "adventure"],
				["%{BKY_SPECTATOR}", "spectator"],
			],
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#d97706",
	tooltip: "",
	helpUrl: "",
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_change_game_mode = (
		block,
		generator,
	) => {
		//dropdown
		const dropdown = block.getFieldValue("GAME_MODE");
		const code = /* javascript */ `
				function changeGameMode() {
				const messageToSend = commandMsg("/gamemode ${dropdown}");
				wss.send(JSON.stringify(messageToSend));
				}
				changeGameMode();
				`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_CHANGE_GAME_MODE: "ゲームモードを %1 に変更する",
		SURVIVAL: "サバイバル",
		CREATIVE: "クリエイティブ",
		ADVENTURE: "アドベンチャー",
		SPECTATOR: "スペクテイター",
	},
	en: {
		MINECRAFT_CHANGE_GAME_MODE: "Change game mode to %1",
		SURVIVAL: "Survival",
		CREATIVE: "Creative",
		ADVENTURE: "Adventure",
		SPECTATOR: "Spectator",
	},
} satisfies globalThis.locale;
