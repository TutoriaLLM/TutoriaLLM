import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_agentPlaceBlock",
	message0: "%{BKY_MINECRAFT_AGENTPLACEBLOCK}",
	args0: [
		{
			type: "field_slider",
			name: "SLOT",
			min: 1,
			max: 27,
			value: 1,
			check: "Number",
		},
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
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#f43f5e",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_agentPlaceBlock = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		function agentPlaceBlock() {
            const slot = ${block.getFieldValue("SLOT")};
            const direction = "${block.getFieldValue("DIRECTION")}";
            const messageToSend = commandMsg("/agent place" + " " + slot + " " + direction);
            wss.send(JSON.stringify(messageToSend));
		}
		agentPlaceBlock();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_AGENTPLACEBLOCK:
			"エージェントが %2 にスロット %1 のブロックを設置する",
		MINECRAFT_FORWARD: "前",
		MINECRAFT_BACKWARD: "後ろ",
		MINECRAFT_LEFT: "左",
		MINECRAFT_RIGHT: "右",
		MINECRAFT_UP: "上",
		MINECRAFT_DOWN: "下",
	},
	en: {
		MINECRAFT_AGENTPLACEBLOCK: "Agent place block on slot %1 to %2",
		MINECRAFT_FORWARD: "forward",
		MINECRAFT_BACKWARD: "backward",
		MINECRAFT_LEFT: "left",
		MINECRAFT_RIGHT: "right",
		MINECRAFT_UP: "up",
		MINECRAFT_DOWN: "down",
	},
} satisfies Locale;
