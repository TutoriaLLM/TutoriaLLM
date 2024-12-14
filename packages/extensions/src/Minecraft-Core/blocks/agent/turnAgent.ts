import { javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_turnAgent",
	message0: "%{BKY_MINECRAFT_TURNAGENT}",
	args0: [
		{
			type: "field_dropdown",
			name: "TURNDIRECTION",
			options: [
				["%{BKY_MINECRAFT_LEFT}", "left"],
				["%{BKY_MINECRAFT_RIGHT}", "right"],
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
	javascriptGenerator.forBlock.ext_minecraft_turnAgent = (block, generator) => {
		const code = /* javascript */ `
		function turnAgent() {
			const turnDirection = "${block.getFieldValue("TURNDIRECTION")}";
            wss.send(JSON.stringify(commandMsg("/agent turn" + " " + turnDirection)));
		}
		turnAgent();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_TURNAGENT: "エージェントを %1 に向ける",
		MINECRAFT_LEFT: "左",
		MINECRAFT_RIGHT: "右",
	},
	en: {
		MINECRAFT_TURNAGENT: "Turn agent to %1",
		MINECRAFT_LEFT: "left",
		MINECRAFT_RIGHT: "right",
	},
} satisfies Locale;
