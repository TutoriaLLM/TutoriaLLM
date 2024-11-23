import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_onminecraftconnection",
	message0: "%{BKY_MINECRAFT_ONMINECRAFTCONNECTION}",
	args0: [
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
	javascriptGenerator.forBlock.ext_minecraft_onminecraftconnection = (
		block,
		generator,
	) => {
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `
		onConnectEvents.push(
			async (message) => {
			${run_input}
			}
		);
	
        `;

		return code;
	};
}

export const locale = {
	en: {
		MINECRAFT_ONMINECRAFTCONNECTION: "on Minecraft Connection %1 %2",
	},
	ja: {
		MINECRAFT_ONMINECRAFTCONNECTION: "Minecraftと接続した時 %1 %2",
	},
};
