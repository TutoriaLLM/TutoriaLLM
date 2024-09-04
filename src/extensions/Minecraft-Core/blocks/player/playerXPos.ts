import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_PlayerXPos",
	colour: "#a855f7",
	message0: "%{BKY_MINECRAFT_VAR_PLAYERXPOS}",
	output: "Number",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_PlayerXPos = (
		block,
		generator,
	) => {
		return ["minecraftWorldState.player.position.x", Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_PLAYERXPOS: "Player X position",
	},
	ja: {
		MINECRAFT_VAR_PLAYERXPOS: "プレイヤーのX座標",
	},
};
