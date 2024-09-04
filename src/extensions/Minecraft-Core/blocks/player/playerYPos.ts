import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_PlayerYPos",
	colour: "#a855f7",
	message0: "%{BKY_MINECRAFT_VAR_PLAYERYPOS}",
	output: "Number",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_PlayerXPos = (
		block,
		generator,
	) => {
		return ["minecraftWorldState.player.position.y", Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_PLAYERYPOS: "Player Y position",
	},
	ja: {
		MINECRAFT_VAR_PLAYERYPOS: "プレイヤーのY座標",
	},
};
