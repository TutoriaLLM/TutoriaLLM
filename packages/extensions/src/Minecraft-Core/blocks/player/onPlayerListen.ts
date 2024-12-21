import { javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_onplayerlisten",
	message0: "%{BKY_MINECRAFT_ONPLAYERLISTEN}",
	args0: [
		{
			type: "field_dropdown",
			name: "FIELD",
			options: [
				["%{BKY_MINECRAFT_ONPLAYERTRAVELLED}", "PlayerTravelled"],
				["%{BKY_MINECRAFT_ONPLAYERDIED}", "PlayerDied"],
				["%{BKY_MINECRAFT_ONPLAYERPLACEDBLOCK}", "BlockPlaced"],
				["%{BKY_MINECRAFT_ONPLAYERBROKEDBLOCK}", "BlockBroken"],
			],
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
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_onplayerlisten = (
		block,
		generator,
	) => {
		const field_input = block.getFieldValue("FIELD");
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `

		//Subscribe to the message event
        onConnectEvents.push(
			async () => {
				if (wss) {
					wss.send(JSON.stringify(subscribeMsg("${field_input}")));
				} else {
					console.error("WebSocket is not connected.");
				}
			}
		);

		//Listen to the message event - for code reloading
		if (wss) {
			wss.send(JSON.stringify(subscribeMsg("${field_input}")));
		}

        onMessageEvents.push(
			async (message) => {
				const data = JSON.parse(message);
				if (data && data.body && data.header.eventName === "${field_input}") {
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
		MINECRAFT_ONPLAYERLISTEN: "on player %1 , %2 %3",
		MINECRAFT_ONPLAYERTRAVELLED: "travelled",
		MINECRAFT_ONPLAYERDIED: "died",
		MINECRAFT_ONPLAYERPLACEDBLOCK: "placed block",
		MINECRAFT_ONPLAYERBROKEDBLOCK: "broke block",
		MINECRAFT_ONPLAYERUSEITEM: "used item",
	},
	ja: {
		MINECRAFT_ONPLAYERLISTEN: "プレイヤーが %1 した時 %2 %3",
		MINECRAFT_ONPLAYERTRAVELLED: "移動",
		MINECRAFT_ONPLAYERDIED: "死亡",
		MINECRAFT_ONPLAYERPLACEDBLOCK: "ブロックを設置",
		MINECRAFT_ONPLAYERBROKEDBLOCK: "ブロックを破壊",
		MINECRAFT_ONPLAYERUSEITEM: "アイテムを使用",
	},
} satisfies Locale;
