import * as Blockly from "blockly";
import { Order, javascriptGenerator } from "blockly/javascript";
import type { extBlock } from "extensionContext";

export const block: extBlock = {
	type: "ext_minecraft_debugmessage",
	message0: "%{BKY_MINECRAFT_DEBUGMESSAGE}",
	previousStatement: null,
	nextStatement: null,
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
	customInit: function (this: Blockly.Block) {
		this.setWarningText(Blockly.Msg.THISISFORDEBUGGING);
	},
};

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
};
