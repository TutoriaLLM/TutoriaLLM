import { Order, javascriptGenerator } from "blockly/javascript";

import image from "../../media/minecraft.png";
export const block = {
	type: "ext_minecraft_sendcommandrequest",
	message0: "%{BKY_MINECRAFT_SENDCOMMANDREQUEST}",
	args0: [
		{
			type: "field_image",
			src: image,
			width: 40,
			height: 40,
		},
		{
			type: "field_input",
			name: "NAME",
			text: "/say hello",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_sendcommandrequest = (
		block,
		generator,
	) => {
		const text_command = block.getFieldValue("COMMAND");
		// todo: Assemble javascript into code variable.
		const code = /* javascript */ `
    commandMsg("${text_command}");
    
    `;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SENDCOMMANDREQUEST: "%1 コマンドを実行する %2",
	},
	en: {
		MINECRAFT_SENDCOMMANDREQUEST: "%1 Execute command %2",
	},
};
