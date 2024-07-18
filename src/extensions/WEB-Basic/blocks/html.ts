import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_web_html",
	message0: "%{BKY_WEB_HTML} %1",
	args0: [
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
	javascriptGenerator.forBlock.ext_web_html = (block, generator) => {
		// Collect argument strings.
		const text_text = block.getFieldValue("TEXT");

		const code = /*javascript*/ `
		html = \`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>Document</title>
		</head>
		<body>
			${text_text}
		</body>
		</html>\`;
		`;

		// Return code.
		return code;
	};
}

export const locale = {
	ja: {
		WEB_HTML: "HTMLでウェブサイトを作成",
	},
	en: {
		WEB_HTML: "Create a website with HTML",
	},
};
