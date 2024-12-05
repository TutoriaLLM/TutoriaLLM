import { inputs } from "blockly";
import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_xyzPosition",
	message0: "%{BKY_MINECRAFT_VAR_XYZPOSITION}",
	colour: "#10b981",
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
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_xyzPosition = (
		block,
		generator,
	) => {
		const PositionX = generator.valueToCode(block, "PosX", Order.ATOMIC);
		const PositionY = generator.valueToCode(block, "PosY", Order.ATOMIC);
		const PositionZ = generator.valueToCode(block, "PosZ", Order.ATOMIC);
		const code = /* javascript */ `
		{
			x: ${PositionX},
			y: ${PositionY},
			z: ${PositionZ},
		}
		`;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_XYZPOSITION: "Position %1 %2 %3",
	},
	ja: {
		MINECRAFT_VAR_XYZPOSITION: "座標 %1 %2 %3",
	},
} satisfies globalThis.locale;
