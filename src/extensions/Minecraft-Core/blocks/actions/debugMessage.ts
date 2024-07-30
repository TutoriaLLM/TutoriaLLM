import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_debugmessage",
	message0: "%{BKY_MINECRAFT_DEBUGMESSAGE}",
	previousStatement: null,
	nextStatement: null,
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_debugmessage = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		        onMessageEvents.push(
			async (message) => {
				console.log(message);
			}
		);		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_DEBUGMESSAGE: "メッセージを表示する",
	},
	en: {
		MINECRAFT_DEBUGMESSAGE: "Display message",
	},
};
