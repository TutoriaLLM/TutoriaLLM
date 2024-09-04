import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_sendcommandrequest",
	message0: "%{BKY_MINECRAFT_SENDCOMMANDREQUEST}",
	args0: [
		{
			type: "input_value",
			value: {
				type: "text",
				name: "COMMAND",
				text: "/say hello",
			},
			name: "COMMAND",
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
		const code = /* javascript */ `
		function sendCmdReq() {
		const messageCommandRequest = commandMsg("${text_command}");
		wss.send(JSON.stringify(messageCommandRequest));
		}
		sendCmdReq();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SENDCOMMANDREQUEST: "コマンドを実行する %1",
	},
	en: {
		MINECRAFT_SENDCOMMANDREQUEST: "Execute command %1",
	},
};
