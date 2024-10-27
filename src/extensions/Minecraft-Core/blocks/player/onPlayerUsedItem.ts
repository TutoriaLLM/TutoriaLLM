import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_onplayerUsedItem",
	message0: "%{BKY_MINECRAFT_ONPLAYERUSEDITEM}",
	args0: [
		{
			type: "input_value",
			name: "ITEM",
			check: "Item",
		},
		{
			type: "input_dummy",
		},
		{
			type: "input_statement",
			name: "INPUT",
		},
	],
	colour: "#6366f1",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_onplayerUsedItem = (
		block,
		generator,
	) => {
		const itemName = generator.valueToCode(block, "ITEM", Order.ATOMIC);
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `
		const itemName = "${itemName}"

		//Subscribe to the message event
		onConnectEvents.push(
			async () => {
				if (wss) {
					wss.send(JSON.stringify(subscribeMsg("ItemUsed")));
				} else {
					console.error("WebSocket is not connected.");
				}
			}
		);

		//Listen to the message event - for code reloading
		if (wss) {
			wss.send(JSON.stringify(subscribeMsg("ItemUsed")));
		}

		onMessageEvents.push(
			async (message) => {
				const data = JSON.parse(message);
				console.log("received", itemName, )
				if (data && data.body && data.header.eventName === "ItemUsed" && data.body.item.id?.toLowerCase() === itemName?.toLowerCase()) { //大文字小文字は無視する
					console.log("matched!", data.body.item.id)
					${run_input}
				}
			}
		);
		`;

		return code;
	};
}

export const locale = {
	en: {
		MINECRAFT_ONPLAYERUSEDITEM: "When player used %1 %2 %3",
	},
	ja: {
		MINECRAFT_ONPLAYERUSEDITEM: "プレイヤーが %1 を使用したとき %2 %3",
	},
};
