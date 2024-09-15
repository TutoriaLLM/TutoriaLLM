import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_onplayerchatcommand",
	message0: "%{BKY_MINECRAFT_ONPLAYERCHATCOMMAND}",
	args0: [
		{
			type: "field_input",
			name: "FIELD",
			text: "hello",
		},
		{
			type: "input_dummy",
		},
		{
			type: "input_statement",
			name: "INPUT",
		},
	],
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_onplayerchatcommand = (
		block,
		generator,
	) => {
		const field_input = block.getFieldValue("FIELD");
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `

        onConnectEvents.push(
			async () => {
				if (wss) {
					wss.send(JSON.stringify(subscribeMsg("PlayerMessage")));
				} else {
					console.error("WebSocket is not connected.");
				}
			}
		);

		if (wss) {
			wss.send(JSON.stringify(subscribeMsg("PlayerMessage")));
		}
		
        onMessageEvents.push(
			async (message) => {
				const data = JSON.parse(message);
				if (data && data.body && data.header.eventName === "PlayerMessage") {
					const messageText = data.body.message;
					if (messageText === "${field_input}") {
						console.log("message matched");
						${run_input}
					}
				}
			}
		);
        `;

		return code;
	};
}

export const locale = {
	en: {
		MINECRAFT_ONPLAYERCHATCOMMAND: "on player chat  %1 %2 %3",
	},
	ja: {
		MINECRAFT_ONPLAYERCHATCOMMAND: "プレイヤーが %1 とチャットしたとき %2 %3",
	},
};
