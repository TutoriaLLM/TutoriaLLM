//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";
import { inputs } from "blockly";
import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_xyzPosition",
	message0: "%{BKY_MINECRAFT_VAR_XYZPOSITION}",
	colour: "#a855f7",
	args0: [
		{
			type: "input_value",
			name: "PosX",
			check: "Number",
		},
		{
			type: "input_value",
			name: "PosY",
			check: "Number",
		},
		{
			type: "input_value",
			name: "PosZ",
			check: "Number",
		},
	],
	inputsInline: true, // インライン入力を有効にする
	output: "Position",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_specificBlockName = (
		block,
		generator,
	) => {
		const PositionX = block.getFieldValue("PosX");
		const PositionY = block.getFieldValue("PosY");
		const PositionZ = block.getFieldValue("PosZ");

		const position = { x: PositionX, y: PositionY, z: PositionZ };
		const stringPosition = JSON.stringify(position);
		return [stringPosition, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_XYZPOSITION: "Position %1 %2 %3",
	},
	ja: {
		MINECRAFT_VAR_XYZPOSITION: "座標 %1 %2 %3",
	},
};
