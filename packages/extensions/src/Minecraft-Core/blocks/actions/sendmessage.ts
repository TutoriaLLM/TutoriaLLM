import { Order, javascriptGenerator } from "blockly/javascript";
export const block = {
	type: "ext_minecraft_sendMsg",
	message0: "%{BKY_MINECRAFT_SENDMESSAGE}",
	args0: [
		{
			type: "input_value",
			name: "MESSAGE",
			field: {
				type: "text",
				text: "hello",
			},
			check: "String",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#d97706",
	tooltip: "",
	helpUrl: "",
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_sendMsg = (block, generator) => {
		const message_to_send = generator.valueToCode(
			block,
			"MESSAGE",
			Order.ATOMIC,
		);
		const code = /* javascript */ `
		const messageToSend = commandMsg("/say ${message_to_send}");
		wss.send(JSON.stringify(messageToSend));
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SENDMESSAGE: "Minecraftにメッセージを送信する %1",
	},
	en: {
		MINECRAFT_SENDMESSAGE: "Send message to Minecraft %1",
	},
} satisfies globalThis.locale;
