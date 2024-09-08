import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_isPlayerUnderWater",
	colour: "#a855f7",
	message0: "%{BKY_MINECRAFT_ISPLAYERUNDERWATER}",
	output: "Boolean",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_isPlayerUnderWater = (
		block,
		generator,
	) => {
		return ["minecraftWorldState.player.isUnderWater", Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_ISPLAYERUNDERWATER: "Is player under water",
	},
	ja: {
		MINECRAFT_ISPLAYERUNDERWATER: "プレイヤーが水中にいる",
	},
};
