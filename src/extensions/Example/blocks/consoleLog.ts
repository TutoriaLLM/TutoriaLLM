import { Order, javascriptGenerator } from "blockly/javascript";
import type { extBlock, extLocale } from "extentionContext";

export const block: extBlock = {
	type: "ext_example_console_log",
	message0: "%{BKY_EXAMPLE_CONSOLE_LOG} %1 %2",
	args0: [
		{
			type: "field_input",
			name: "TEXT",
			text: "hello world!",
		},
		{
			type: "input_value",
			name: "VAR",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#57534e",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_example_console_log = (block, generator) => {
		// Collect argument strings.
		const text_text = block.getFieldValue("TEXT");
		const var_var = generator.valueToCode(block, "VAR", Order.ATOMIC);

		const code = `console.log("${text_text}", ${var_var});\n`;

		// Return code.
		return code;
	};
}

export const locale: extLocale = {
	ja: {
		EXAMPLE_CONSOLE_LOG: "コンソールにテキストを送信",
	},
	en: {
		EXAMPLE_CONSOLE_LOG: "send console.log text",
	},
};
