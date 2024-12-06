import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_server_log",
	message0: "%{BKY_SERVER_LOG} %1",
	args0: [
		{
			type: "input_value",
			name: "INPUT",
			check: "String",
		},
	],
	previousStatement: null,
	nextStatement: null,
	inputsInline: true,
	colour: "#57534e",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_server_log = (block, generator) => {
		// Collect argument strings.
		const var_var = generator.valueToCode(block, "INPUT", Order.ATOMIC);

		const code = `console.log(${var_var});\n`;

		// Return code.
		return code;
	};
}

export const locale = {
	ja: {
		SERVER_LOG: "チャットにテキストを送信",
	},
	en: {
		SERVER_LOG: "send text to chat",
	},
} satisfies Locale;
