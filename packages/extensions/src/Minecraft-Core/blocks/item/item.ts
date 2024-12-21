//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";

import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_var_specificItemName",
	message0: "%{BKY_MINECRAFT_VAR_SPECIFICITEMNAME}",
	colour: "#22c55e",
	args0: [
		{
			type: "field_input",
			name: "ITEM",
		},
	],

	output: "Item",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_specificItemName = (
		block,
		generator,
	) => {
		const ItemName = block.getFieldValue("ITEM");
		return [ItemName, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_SPECIFICITEMNAME: "Item Name %1",
	},
	ja: {
		MINECRAFT_VAR_SPECIFICITEMNAME: "Minecraftのアイテム名 %1",
	},
} satisfies Locale;
