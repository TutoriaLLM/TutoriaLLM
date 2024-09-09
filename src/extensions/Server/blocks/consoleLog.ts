import { Order, javascriptGenerator } from "blockly/javascript";
import type { extBlock, extLocale } from "extentionContext";
import type * as Blockly from "blockly";

export const block: extBlock = {
	type: "ext_server_log",
	message0: "%{BKY_SERVER_LOG} %1",
	args0: [
		{
			type: "input_value",
			name: "STRING",
			check: "String",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#57534e",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_server_log = (block, generator) => {
		// Collect argument strings.
		const var_var = generator.valueToCode(block, "STRING", Order.ATOMIC);

		const code = `console.log(\`${var_var}\`);\n`;

		// Return code.
		return code;
	};
}

export const locale: extLocale = {
	ja: {
		SERVER_LOG: "チャットにテキストを送信",
	},
	en: {
		SERVER_LOG: "send text to chat",
	},
};
