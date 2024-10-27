import { Order, javascriptGenerator } from "blockly/javascript";
export const block = {
	type: "ext_minecraft_change_specific_time",
	message0: "%{BKY_MINECRAFT_CHANGE_SPECIFIC_TIME}",
	args0: [
		{
			type: "input_value",
			name: "TIME",
			check: "Number",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#d97706",
	tooltip: "Set time to specific time by game tick (0-24000)",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_change_specific_time = (
		block,
		generator,
	) => {
		//dropdown
		const dropdown = block.getFieldValue("TIME");
		const code = /* javascript */ `
				function changeSpecificTime() {
                let time = generator.valueToCode(block, "Time", Order.ATOMIC);
				const messageToSend = commandMsg("/time set " + time);
				wss.send(JSON.stringify(messageToSend));
				}
				changeSpecificTime();
				`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_CHANGE_SPECIFIC_TIME: "時間を %1 に変更する",
	},
	en: {
		MINECRAFT_CHANGE_SPECIFIC_TIME: "Change time to %1",
	},
};
