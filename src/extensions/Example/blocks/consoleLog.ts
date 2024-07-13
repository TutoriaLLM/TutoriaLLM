import { Order, javascriptGenerator } from "blockly/javascript";

import image from "../media/terminal.png";

export const block = {
	type: "ext_example_console_log",
	message0: "%1 %{BKY_EXAMPLE_CONSOLE_LOG} %2",
	args0: [
		{
			type: "field_image",
			src: image,
			width: 40,
			height: 40,
		},
		{
			type: "field_input",
			name: "TEXT",
			text: "hello world!",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: 230,
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_example_console_log = (block, generator) => {
		// Collect argument strings.
		const text_text = block.getFieldValue("TEXT");

		const code = `console.log("${text_text}");\n`;

		// Return code.
		return code;
	};
}

export const locale = {
	ja: {
		EXAMPLE_CONSOLE_LOG: "コンソールにテキストを送信",
	},
	en: {
		EXAMPLE_CONSOLE_LOG: "send console.log text",
	},
};
