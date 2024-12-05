import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_isPlayerUnderWater",
	colour: "#6366f1",
	message0: "%{BKY_MINECRAFT_ISPLAYERUNDERWATER}",
	output: "Boolean",
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_isPlayerUnderWater = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		minecraftWorldState.player.isUnderWater
		`;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_ISPLAYERUNDERWATER: "Is player under water",
	},
	ja: {
		MINECRAFT_ISPLAYERUNDERWATER: "プレイヤーが水中にいる",
	},
} satisfies globalThis.locale;
