//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";
import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_specificBlockName",
	message0: "%{BKY_MINECRAFT_VAR_SPECIFICBLOCKNAME}",
	colour: "#a855f7",
	args0: [
		{
			type: "field_input",
			name: "BLOCK",
		},
	],

	output: "Block",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_specificBlockName = (
		block,
		generator,
	) => {
		const blockName = block.getFieldValue("BLOCK");
		return [blockName, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_SPECIFICBLOCKNAME: "Minecraft Block Name %1",
	},
	ja: {
		MINECRAFT_VAR_SPECIFICBLOCKNAME: "Minecraftのブロック名 %1",
	},
};
