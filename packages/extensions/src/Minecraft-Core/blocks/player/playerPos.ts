import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_var_PlayerPos", //XYZ座標を取得するブロック
	colour: "#6366f1",
	message0: "%{BKY_MINECRAFT_VAR_PLAYERPOS}", //プレイヤーの座標
	output: "Position",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_PlayerPos = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
        {
			x: minecraftWorldState.player.position.x,
			y: minecraftWorldState.player.position.y,
			z: minecraftWorldState.player.position.z,
		};
        `;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_PLAYERPOS: "Player Position",
	},
	ja: {
		MINECRAFT_VAR_PLAYERPOS: "プレイヤーの座標",
	},
} satisfies Locale;
