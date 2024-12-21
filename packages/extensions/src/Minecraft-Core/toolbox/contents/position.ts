import type * as Blockly from "blockly";
export const position: Blockly.utils.toolbox.StaticCategoryInfo["contents"] = [
	{
		kind: "block",
		type: "ext_minecraft_var_xyzPosition",
		inputs: {
			PosX: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "0",
					},
				},
			},
			PosY: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "0",
					},
				},
			},
			PosZ: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "0",
					},
				},
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_var_xyzRelativePosition",
		inputs: {
			PosX: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "0",
					},
				},
			},
			PosY: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "0",
					},
				},
			},
			PosZ: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "0",
					},
				},
			},
		},
	},
];
