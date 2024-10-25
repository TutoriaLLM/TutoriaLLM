import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_PlayerPos", //XYZ座標を取得するブロック
	colour: "#a855f7",
	message0: "%{BKY_MINECRAFT_VAR_PLAYERPOS}", //プレイヤーの座標
	output: "Position",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_PlayerPos = (
		block,
		generator,
	) => {
		const position = {
			x: "minecraftWorldState.player.position.x",
			y: "minecraftWorldState.player.position.y",
			z: "minecraftWorldState.player.position.z",
		};
		const output = JSON.stringify(position);
		return [output, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_PLAYERPOS: "Player Position",
	},
	ja: {
		MINECRAFT_VAR_PLAYERPOS: "プレイヤーの座標",
	},
};
