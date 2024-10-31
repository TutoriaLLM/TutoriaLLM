import { Order, javascriptGenerator } from "blockly/javascript";
import "@blockly/field-slider";

export const block = {
	type: "ext_minecraft_setAgentBlock",
	message0: "%{BKY_MINECRAFT_SETAGENTBLOCK}",
	args0: [
		{
			type: "field_slider",
			name: "SLOT",
			min: 1,
			max: 27,
			value: 1,
			check: "Number",
		},
		{
			type: "input_end_row",
		},
		{
			type: "input_value",
			name: "BLOCK",
			check: "Block",
		},
		{
			type: "field_slider",
			name: "NUMBER",
			min: 1,
			max: 64,
			value: 1,
			check: "Number",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#f43f5e",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_setAgentBlock = (
		block,
		generator,
	) => {
		const blockName = generator.valueToCode(block, "BLOCK", Order.ATOMIC);
		const code = /* javascript */ `
		function setAgentBlock() {
			const slot = ${block.getFieldValue("SLOT")};
			let number = ${block.getFieldValue("NUMBER")};
            if(number > 64){
                number = 64;
            }   
			// /agent setitem <slot> <itemName> <count> <data> ...データ値の入力は必須だが、Bedrock版ではすでにブロック名だけでブロックが特定できるため、０を入力する

            const messageToSend = commandMsg("/agent setitem" + " " + slot + " " + "${blockName}" + " " + number + " " + "0");
			wss.send(JSON.stringify(messageToSend));
		}
		setAgentBlock();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SETAGENTBLOCK:
			"エージェントのインベントリの %1 つめのスロットに %2 %3 のブロックを %4 個セットする",
	},
	en: {
		MINECRAFT_SETAGENTBLOCK:
			"Set blocks %4 of %3 to %2 Agent's  inventory slot %1",
	},
};
