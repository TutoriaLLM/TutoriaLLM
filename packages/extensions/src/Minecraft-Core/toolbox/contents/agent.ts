import type * as Blockly from "blockly";
export const agent: Blockly.utils.toolbox.StaticCategoryInfo["contents"] = [
	{
		kind: "block",
		type: "ext_minecraft_TeleportAgentToPlayer",
	},
	{
		kind: "block",
		type: "ext_minecraft_createAgent",
	},
	{
		kind: "block",
		type: "ext_minecraft_agentDestroy",
	},
	{
		kind: "block",
		type: "ext_minecraft_var_AgentPos",
	},
	{
		kind: "block",
		type: "ext_minecraft_moveAgent",
		inputs: {
			DISTANCE: {
				shadow: {
					type: "math_number",
					fields: {
						NUM: "1",
					},
				},
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_turnAgent",
	},
	{
		kind: "block",
		type: "ext_minecraft_setAgentBlock",
		inputs: {
			BLOCK: {
				shadow: {
					type: "ext_minecraft_var_blockDropdown",
					fields: {
						BLOCK: "GRASS",
					},
				},
			},
		},
	},
	{
		kind: "block",
		type: "ext_minecraft_agentPlaceBlock",
	},
];
