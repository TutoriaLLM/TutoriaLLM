import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";
import "@blockly/field-slider";

export const block = {
	type: "ext_minecraft_setBlock",
	message0: "%{BKY_MINECRAFT_SETBLOCK}",
	args0: [
		{
			type: "input_value",
			name: "BLOCK",
			check: "Block",
		},
		{
			type: "input_end_row",
		},
		{
			type: "input_value",
			name: "POS",
			check: "Position", //positionは {x: number, y: number, z: number} という形式のオブジェクト（パースする必要あり）
		},
	],
	inputsInline: true, // インライン入力を有効にする
	previousStatement: null,
	nextStatement: null,
	colour: "#22c55e",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_setBlock = (block, generator) => {
		const position = generator.valueToCode(block, "POS", Order.ATOMIC);
		const code = /* javascript */ `
		function setBlock() {
            const position = ${position};
			const positionToSet = { x: position.x, y: position.y-1, z: position.z };
            const messageToSend = commandMsg("/setblock" + " " + positionToSet.x + " " + positionToSet.y + " " + positionToSet.z + " " + "${generator.valueToCode(block, "BLOCK", Order.ATOMIC)}");
			wss.send(JSON.stringify(messageToSend));
		}
		setBlock();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SETBLOCK: "%1 ブロックを %2 %3 に設置する",
	},
	en: {
		MINECRAFT_SETBLOCK: "Place %1 block %2 at %3",
	},
} satisfies Locale;
