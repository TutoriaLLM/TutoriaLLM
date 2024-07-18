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
		// Collect argument strings.
		const field_input = block.getFieldValue("FIELD");
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `
		//Scriptで定義済みの関数を使用する
		// イベントリスナーを設定
		onMessageEvent = async (message) => {
			console.log("Message received:", message);
			const data = JSON.parse(message);
			if (data && data.body && data.header.eventName === "PlayerMessage") {
				const messageText = data.body.message;
				if (messageText === "${field_input}") {
				${run_input}
			}}
		};
    `;

		// Return code.
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
