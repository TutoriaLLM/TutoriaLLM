import type * as Blockly from "blockly";
export const block: Blockly.utils.toolbox.StaticCategoryInfo["contents"] = [
	{
		kind: "block",
		type: "ext_minecraft_var_toolsDropdown",
	},
	{
		kind: "block",
		type: "ext_minecraft_var_specificItemName",
	},
	{
		kind: "block",
		type: "ext_minecraft_var_blockDropdown",
	},
	{
		kind: "block",
		type: "ext_minecraft_var_specificBlockName",
	},
	{
		kind: "block",
		type: "ext_minecraft_fillBlock",
		inputs: {
			BLOCK: {
				shadow: {
					type: "ext_minecraft_var_blockDropdown",
					fields: {
						BLOCK: "STONE",
					},
				},
			},
			fromPos: {
				shadow: {
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
			},
			toPos: {
				shadow: {
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
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_setBlock",
		inputs: {
			BLOCK: {
				shadow: {
					type: "ext_minecraft_var_blockDropdown",
					fields: {
						BLOCK: "STONE",
					},
				},
			},
			POS: {
				shadow: {
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
			},
		},
	},
];
