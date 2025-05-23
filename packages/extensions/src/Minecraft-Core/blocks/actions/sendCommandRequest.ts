import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_sendcommandrequest",
	message0: "%{BKY_MINECRAFT_SENDCOMMANDREQUEST}",
	args0: [
		{
			type: "input_value",
			name: "COMMAND",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#d97706",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_sendcommandrequest = (
		block,
		generator,
	) => {
		const text_command = generator.valueToCode(block, "COMMAND", Order.ATOMIC);
		console.log(text_command);
		const code = /* javascript */ `
		function sendCmdReq() {
		const messageCommandRequest = commandMsg(${text_command});
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
} satisfies Locale;
