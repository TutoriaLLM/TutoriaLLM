import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_debugmessage",
	message0: "%{BKY_MINECRAFT_DEBUGMESSAGE}",
	previousStatement: null,
	nextStatement: null,
	colour: "#64748b",
	tooltip: "",
	helpUrl: "",
	customInit: function (this: Blockly.Block) {
		this.setWarningText(Blockly.Msg.THISISFORDEBUGGING);
	},
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_debugmessage = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		        onMessageEvents.push(
			async (message) => {
				console.log(message);
			}
		);		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_DEBUGMESSAGE: "メッセージを表示する",
		THISISFORDEBUGGING: "これはデバッグ用です",
	},
	en: {
		MINECRAFT_DEBUGMESSAGE: "Display message",
		THISISFORDEBUGGING: "This is for debugging",
	},
} satisfies Locale;
