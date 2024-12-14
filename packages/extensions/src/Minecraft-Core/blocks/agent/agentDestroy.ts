import { javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_agentDestroy",
	message0: "%{BKY_MINECRAFT_AGENT_DESTROY}",
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
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#f43f5e",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_agentDestroy = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		function agentDestroy() {
			const direction = "${block.getFieldValue("DIRECTION")}";
			wss.send(JSON.stringify(commandMsg("/agent destroy" + " " + direction)));
		}
		agentDestroy();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_AGENT_DESTROY: "エージェントに %1 のブロックを破壊させる",
		MINECRAFT_FORWARD: "前",
		MINECRAFT_BACKWARD: "後ろ",
		MINECRAFT_LEFT: "左",
		MINECRAFT_RIGHT: "右",
		MINECRAFT_UP: "上",
		MINECRAFT_DOWN: "下",
	},
	en: {
		MINECRAFT_AGENT_DESTROY: "Destroy %1 block to agent",
		MINECRAFT_FORWARD: "forward",
		MINECRAFT_BACKWARD: "backward",
		MINECRAFT_LEFT: "left",
		MINECRAFT_RIGHT: "right",
		MINECRAFT_UP: "up",
		MINECRAFT_DOWN: "down",
	},
} satisfies Locale;
