import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_var_PlayerXPos",
	colour: "#6366f1",
	message0: "%{BKY_MINECRAFT_VAR_PLAYERXPOS}",
	output: "Number",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_PlayerXPos = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		minecraftWorldState.player.position.x
		`;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_PLAYERXPOS: "Player X position",
	},
	ja: {
		MINECRAFT_VAR_PLAYERXPOS: "プレイヤーのX座標",
	},
} satisfies Locale;
