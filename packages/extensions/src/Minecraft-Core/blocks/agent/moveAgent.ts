import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_moveAgent",
	message0: "%{BKY_MINECRAFT_MOVEAGENT}",
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
			type: "input_value",
			name: "DISTANCE",
			check: "Number",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#f43f5e",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_moveAgent = (block, generator) => {
		const code = /* javascript */ `
		function moveAgent() {
			const distance = ${generator.valueToCode(block, "DISTANCE", Order.ATOMIC)};
			const direction = "${block.getFieldValue("DIRECTION")}";
			const messageToSend = commandMsg("/agent move" + " " + direction);
			for (let i = 0; i < distance; i++) {
				wss.send(JSON.stringify(messageToSend));
			}
		}
		moveAgent();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_MOVEAGENT: "エージェントを %1 に %2 ブロック移動させる",
		MINECRAFT_FORWARD: "前",
		MINECRAFT_BACKWARD: "後ろ",
		MINECRAFT_LEFT: "左",
		MINECRAFT_RIGHT: "右",
		MINECRAFT_UP: "上",
		MINECRAFT_DOWN: "下",
	},
	en: {
		MINECRAFT_MOVEAGENT: "Move Agent to %1 by %2 blocks",
		MINECRAFT_FORWARD: "forward",
		MINECRAFT_BACKWARD: "backward",
		MINECRAFT_LEFT: "left",
		MINECRAFT_RIGHT: "right",
		MINECRAFT_UP: "up",
		MINECRAFT_DOWN: "down",
	},
} satisfies Locale;
