import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_var_PlayerYPos",
	colour: "#6366f1",
	message0: "%{BKY_MINECRAFT_VAR_PLAYERYPOS}",
	output: "Number",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_PlayerYPos = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		minecraftWorldState.player.position.y
		`;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_PLAYERYPOS: "Player Y position",
	},
	ja: {
		MINECRAFT_VAR_PLAYERYPOS: "プレイヤーのY座標",
	},
} satisfies Locale;
