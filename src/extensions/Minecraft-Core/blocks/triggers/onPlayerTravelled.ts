import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_onplayertransform",
	message0: "%{BKY_MINECRAFT_ONPLAYERTRAVELLED}",
	args0: [
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
	javascriptGenerator.forBlock.ext_minecraft_onplayertransform = (
		block,
		generator,
	) => {
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `

        onMessageEvents.push(
			async (message) => {
				const data = JSON.parse(message);
				if (data && data.body && data.header.eventName === "PlayerTravelled") {
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
		MINECRAFT_ONPLAYERTRAVELLED: "on player Transform %1 %2",
	},
	ja: {
		MINECRAFT_ONPLAYERTRAVELLED: "プレイヤーが移動した時 %1 %2",
	},
};
