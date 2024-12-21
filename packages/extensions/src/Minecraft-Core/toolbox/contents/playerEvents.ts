import type * as Blockly from "blockly";
export const playerEvents: Blockly.utils.toolbox.StaticCategoryInfo["contents"] =
	[
		{
			kind: "block",
			type: "ext_minecraft_onplayerchatcommand",
		},
		{
			kind: "block",
			type: "ext_minecraft_onminecraftconnection",
		},
		{
			kind: "block",
			type: "ext_minecraft_onplayerlisten",
		},
		{
			kind: "block",
			type: "ext_minecraft_onplayerUsedItem",
			inputs: {
				ITEM: {
					shadow: {
						type: "ext_minecraft_var_toolsDropdown",
						fields: {
							ITEM: "FISHING_ROD",
						},
					},
				},
			},
		},
		{
			kind: "block",
			type: "ext_minecraft_var_PlayerPos",
		},
		{
			kind: "block",
			type: "ext_minecraft_var_PlayerXPos",
		},
		{
			kind: "block",
			type: "ext_minecraft_var_PlayerYPos",
		},
		{
			kind: "block",
			type: "ext_minecraft_var_PlayerZPos",
		},
		{
			kind: "block",
			type: "ext_minecraft_isPlayerUnderWater",
		},
	];
