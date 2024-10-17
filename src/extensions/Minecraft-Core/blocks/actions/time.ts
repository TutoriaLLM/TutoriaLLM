import { Order, javascriptGenerator } from "blockly/javascript";
export const block = {
	type: "ext_minecraft_change_time",
	message0: "%{BKY_MINECRAFT_CHANGETIME}",
	args0: [
		{
			type: "field_dropdown",
			name: "TIME",
			options: [
				["%{BKY_DAY}", "day"],
				["%{BKY_NIGHT}", "night"],
				["%{BKY_NOON}", "noon"],
				["%{BKY_MIDNIGHT}", "midnight"],
			],
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_change_time = (
		block,
		generator,
	) => {
		//dropdown
		const dropdown = block.getFieldValue("TIME");
		const code = /* javascript */ `
				function changeTime() {
				const messageToSend = commandMsg("/time set ${dropdown}");
				wss.send(JSON.stringify(messageToSend));
				}
				changeTime();
				`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_CHANGETIME: "時間を %1 に変更する",
		DAY: "昼",
		NIGHT: "夜",
		NOON: "正午",
		MIDNIGHT: "真夜中",
	},
	en: {
		MINECRAFT_CHANGETIME: "Change time to %1",
		DAY: "Day",
		NIGHT: "Night",
		NOON: "Noon",
		MIDNIGHT: "Midnight",
	},
};
