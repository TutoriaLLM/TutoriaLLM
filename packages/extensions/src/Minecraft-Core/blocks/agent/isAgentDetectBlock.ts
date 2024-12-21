import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

//WIP - Not working
export const block = {
	type: "ext_minecraft_isAgentDetectBlock",
	colour: "#6366f1",
	message0: "%{BKY_MINECRAFT_ISAGENTDETECTBLOCK}",
	args0: [
		{
			type: "field_dropdown",
			name: "DIRECTION",
			options: [
				["%{BKY_MINECRAFT_FORWARD}", "forward"],
				["%{BKY_MINECRAFT_BACKWARD}", "back"],
				["%{BKY_MINECRAFT_LEFT}", "left"],
				["%{BKY_MINECRAFT_RIGHT}", "right"],
				["%{BKY_MINECRAFT_UP}", "up"],
				["%{BKY_MINECRAFT_DOWN}", "down"],
			],
		},
		{
			type: "field_dropdown",
			name: "TYPE",
			options: [
				["%{BKY_MINECRAFT_REDSTONE}", "redstone"],
				["%{BKY_MINECRAFT_BLOCK}", "block"],
			],
		},
	],

	output: "Boolean",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_isAgentDetectBlock = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		minecraftWorldState.agent.detectBlock(
			"${block.getFieldValue("DIRECTION")}",
			"${block.getFieldValue("TYPE")}"
		)
        `;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_ISAGENTDETECTBLOCK: "Is agent detect %1 block in %2 direction",
		MINECRAFT_BLOCK: "block",
		MINECRAFT_REDSTONE: "redstone",
		MINECRAFT_FORWARD: "forward",
		MINECRAFT_BACKWARD: "backward",
		MINECRAFT_LEFT: "left",
		MINECRAFT_RIGHT: "right",
		MINECRAFT_UP: "up",
		MINECRAFT_DOWN: "down",
	},
	ja: {
		MINECRAFT_ISAGENTDETECTBLOCK: "エージェントが %1 を %2 方向に検知している",
		MINECRAFT_BLOCK: "ブロック",
		MINECRAFT_REDSTONE: "レッドストーン",
		MINECRAFT_FORWARD: "前",
		MINECRAFT_BACKWARD: "後ろ",
		MINECRAFT_LEFT: "左",
		MINECRAFT_RIGHT: "右",
		MINECRAFT_UP: "上",
		MINECRAFT_DOWN: "下",
	},
} satisfies Locale;
