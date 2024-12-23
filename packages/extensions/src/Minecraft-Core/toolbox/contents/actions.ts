import type * as Blockly from "blockly";
export const actions: Blockly.utils.toolbox.StaticCategoryInfo["contents"] = [
	{
		kind: "block",
		type: "ext_minecraft_sendcommandrequest",
		inputs: {
			COMMAND: {
				shadow: {
					type: "text",
					fields: {
						TEXT: "/say Hello!",
					},
				},
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_sendMsg",
		inputs: {
			MESSAGE: {
				shadow: {
					type: "text",
					fields: {
						TEXT: "Hello, Server!",
					},
				},
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_debugmessage",
	},
	{
		kind: "block",
		type: "ext_minecraft_summon_mob",
		inputs: {
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
	{
		kind: "block",
		type: "ext_minecraft_summon_monster",
		inputs: {
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

	{
		kind: "block",
		type: "ext_minecraft_change_weather",
	},
	{
		kind: "block",
		type: "ext_minecraft_change_specific_time",
		inputs: {
			TIME: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "10000",
					},
				},
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_change_time",
	},
	{
		kind: "block",
		type: "ext_minecraft_change_game_mode",
	},
];
