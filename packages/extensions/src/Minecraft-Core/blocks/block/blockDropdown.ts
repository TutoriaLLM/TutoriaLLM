//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";
import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";
import "@blockly/field-grid-dropdown";

const cdnUrl =
	"https://cdn.jsdelivr.net/gh/Tutoriallm/bedrock-samples@main/resource_pack/textures/blocks";

export const block = {
	type: "ext_minecraft_var_blockDropdown",
	message0: "%{BKY_MINECRAFT_VAR_BLOCKDROPDOWN}",
	colour: "#22c55e",

	args0: [
		{
			type: "field_grid_dropdown",
			name: "BLOCK",
			options: [
				[
					{
						src: `${cdnUrl}/structure_air.png`,
						width: 30,
						height: 30,
						alt: "Air",
					},
					"AIR",
				],
				[
					{
						src: `${cdnUrl}/stone.png`,
						width: 30,
						height: 30,
						alt: "Stone",
					},
					"STONE",
				],
				[
					{
						src: `${cdnUrl}/grass_side_carried.png`,
						width: 30,
						height: 30,
						alt: "Grass",
					},
					"GRASS",
				],
				[
					{
						src: `${cdnUrl}/dirt.png`,
						width: 30,
						height: 30,
						alt: "Dirt",
					},
					"DIRT",
				],
				[
					{
						src: `${cdnUrl}/cobblestone.png`,
						width: 30,
						height: 30,
						alt: "Cobblestone",
					},
					"COBBLESTONE",
				],
				[
					{
						src: `${cdnUrl}/planks_oak.png`,
						width: 30,
						height: 30,
						alt: "Planks",
					},
					"PLANKS",
				],
				[
					{
						src: `${cdnUrl}/sapling_oak.png`,
						width: 30,
						height: 30,
						alt: "Sapling",
					},
					"SAPLING",
				],
				[
					{
						src: `${cdnUrl}/bedrock.png`,
						width: 30,
						height: 30,
						alt: "Bedrock",
					},
					"BEDROCK",
				],
				[
					{
						src: `${cdnUrl}/water_placeholder.png`,
						width: 30,
						height: 30,
						alt: "Sand",
					},
					"WATER",
				],
				[
					{
						src: `${cdnUrl}/lava_placeholder.png`,
						width: 30,
						height: 30,
						alt: "Lava",
					},
					"LAVA",
				],
				[
					{
						src: `${cdnUrl}/sand.png`,
						width: 30,
						height: 30,
						alt: "Sand",
					},
					"SAND",
				],
				[
					{
						src: `${cdnUrl}/gravel.png`,
						width: 30,
						height: 30,
						alt: "Gravel",
					},
					"GRAVEL",
				],
				[
					{
						src: `${cdnUrl}/gold_ore.png`,
						width: 30,
						height: 30,
						alt: "Gold_ore",
					},
					"GOLD_ORE",
				],
				[
					{
						src: `${cdnUrl}/iron_ore.png`,
						width: 30,
						height: 30,
						alt: "Iron_ore",
					},
					"IRON_ORE",
				],
				[
					{
						src: `${cdnUrl}/coal_ore.png`,
						width: 30,
						height: 30,
						alt: "Coal_ore",
					},
					"COAL_ORE",
				],
				[
					{
						src: `${cdnUrl}/log_oak.png`,
						width: 30,
						height: 30,
						alt: "Log",
					},
					"LOG",
				],
				[
					{
						src: `${cdnUrl}/sponge.png`,
						width: 30,
						height: 30,
						alt: "Sponge",
					},
					"SPONGE",
				],
				[
					{
						src: `${cdnUrl}/glass.png`,
						width: 30,
						height: 30,
						alt: "Glass",
					},
					"GLASS",
				],
				[
					{
						src: `${cdnUrl}/lapis_ore.png`,
						width: 30,
						height: 30,
						alt: "Lapis_ore",
					},
					"LAPIS_ORE",
				],
				[
					{
						src: `${cdnUrl}/lapis_block.png`,
						width: 30,
						height: 30,
						alt: "Lapis_block",
					},
					"LAPIS_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/dispenser_front_horizontal.png`,
						width: 30,
						height: 30,
						alt: "Dispenser",
					},
					"DISPENSER",
				],
				[
					{
						src: `${cdnUrl}/sandstone_normal.png`,
						width: 30,
						height: 30,
						alt: "Sandstone",
					},
					"SANDSTONE",
				],
				[
					{
						src: `${cdnUrl}/noteblock.png`,
						width: 30,
						height: 30,
						alt: "Noteblock",
					},
					"NOTEBLOCK",
				],
				[
					{
						src: `${cdnUrl}/bed_head_top.png`,
						width: 30,
						height: 30,
						alt: "Bed",
					},
					"BED",
				],
				[
					{
						src: `${cdnUrl}/rail_golden.png`,
						width: 30,
						height: 30,
						alt: "Golden_rail",
					},
					"POWERED_RAIL",
				],
				[
					{
						src: `${cdnUrl}/rail_detector.png`,
						width: 30,
						height: 30,
						alt: "Detector_rail",
					},
					"DETECTOR_RAIL",
				],
				[
					{
						src: `${cdnUrl}/piston_top_sticky.png`,
						width: 30,
						height: 30,
						alt: "Sticky_piston",
					},
					"STICKY_PISTON",
				],

				[
					{
						src: `${cdnUrl}/piston_top_normal.png`,
						width: 30,
						height: 30,
						alt: "Piston",
					},
					"PISTON",
				],
				[
					{
						src: `${cdnUrl}/wool_colored_white.png`,
						width: 30,
						height: 30,
						alt: "Wool",
					},
					"WOOL",
				],
				[
					{
						src: `${cdnUrl}/flower_rose.png`,
						width: 30,
						height: 30,
						alt: "Red_flower",
					},
					"RED_FLOWER",
				],
				[
					{
						src: `${cdnUrl}/mushroom_brown.png`,
						width: 30,
						height: 30,
						alt: "Brown_mushroom",
					},
					"BROWN_MUSHROOM",
				],
				[
					{
						src: `${cdnUrl}/mushroom_red.png`,
						width: 30,
						height: 30,
						alt: "Red_mushroom",
					},
					"RED_MUSHROOM",
				],
				[
					{
						src: `${cdnUrl}/gold_block.png`,
						width: 30,
						height: 30,
						alt: "Gold_block",
					},
					"GOLD_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/iron_block.png`,
						width: 30,
						height: 30,
						alt: "Iron_block",
					},
					"IRON_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/brick.png`,
						width: 30,
						height: 30,
						alt: "Brick_block",
					},
					"BRICK_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/tnt_top.png`,
						width: 30,
						height: 30,
						alt: "Tnt",
					},
					"TNT",
				],
				[
					{
						src: `${cdnUrl}/bookshelf.png`,
						width: 30,
						height: 30,
						alt: "Bookshelf",
					},
					"BOOKSHELF",
				],
				[
					{
						src: `${cdnUrl}/cobblestone_mossy.png`,
						width: 30,
						height: 30,
						alt: "Mossy_cobblestone",
					},
					"MOSSY_COBBLESTONE",
				],
				[
					{
						src: `${cdnUrl}/obsidian.png`,
						width: 30,
						height: 30,
						alt: "Obsidian",
					},
					"OBSIDIAN",
				],
				[
					{
						src: `${cdnUrl}/torch_on.png`,
						width: 30,
						height: 30,
						alt: "Torch",
					},
					"TORCH",
				],
				[
					{
						src: `${cdnUrl}/fire_0_placeholder.png`,
						width: 30,
						height: 30,
						alt: "Fire",
					},
					"FIRE",
				],
				[
					{
						src: `${cdnUrl}/redstone_dust_cross.png`,
						width: 30,
						height: 30,
						alt: "Redstone_wire",
					},
					"REDSTONE_WIRE",
				],
				[
					{
						src: `${cdnUrl}/diamond_ore.png`,
						width: 30,
						height: 30,
						alt: "Diamond_ore",
					},
					"DIAMOND_ORE",
				],
				[
					{
						src: `${cdnUrl}/diamond_block.png`,
						width: 30,
						height: 30,
						alt: "Diamond_block",
					},
					"DIAMOND_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/crafting_table_top.png`,
						width: 30,
						height: 30,
						alt: "Crafting_table",
					},
					"CRAFTING_TABLE",
				],
				[
					{
						src: `${cdnUrl}/furnace_front_on.png`,
						width: 30,
						height: 30,
						alt: "Furnace",
					},
					"FURNACE",
				],
				[
					{
						src: `${cdnUrl}/door_wood.png`,
						width: 30,
						height: 30,
						alt: "Wooden_door",
					},
					"WOODEN_DOOR",
				],
				[
					{
						src: `${cdnUrl}/ladder.png`,
						width: 30,
						height: 30,
						alt: "Ladder",
					},
					"LADDER",
				],
				[
					{
						src: `${cdnUrl}/rail_normal.png`,
						width: 30,
						height: 30,
						alt: "Rail",
					},
					"RAIL",
				],
				[
					{
						src: `${cdnUrl}/lever.png`,
						width: 30,
						height: 30,
						alt: "Lever",
					},
					"LEVER",
				],
				[
					{
						src: `${cdnUrl}/door_iron.png`,
						width: 30,
						height: 30,
						alt: "Iron_door",
					},
					"IRON_DOOR",
				],
				[
					{
						src: `${cdnUrl}/redstone_ore.png`,
						width: 30,
						height: 30,
						alt: "Redstone_ore",
					},
					"REDSTONE_ORE",
				],
				[
					{
						src: `${cdnUrl}/redstone_torch_on.png`,
						width: 30,
						height: 30,
						alt: "Redstone_torch",
					},
					"REDSTONE_TORCH",
				],
				[
					{
						src: `${cdnUrl}/ice.png`,
						width: 30,
						height: 30,
						alt: "Ice",
					},
					"ICE",
				],
				[
					{
						src: `${cdnUrl}/snow.png`,
						width: 30,
						height: 30,
						alt: "Snow",
					},
					"SNOW",
				],

				[
					{
						src: `${cdnUrl}/clay.png`,
						width: 30,
						height: 30,
						alt: "Clay",
					},
					"CLAY",
				],
				[
					{
						src: `${cdnUrl}/jukebox_top.png`,
						width: 30,
						height: 30,
						alt: "Jukebox",
					},
					"JUKEBOX",
				],

				[
					{
						src: `${cdnUrl}/netherrack.png`,
						width: 30,
						height: 30,
						alt: "Netherrack",
					},
					"NETHERRACK",
				],
				[
					{
						src: `${cdnUrl}/soul_sand.png`,
						width: 30,
						height: 30,
						alt: "Soul_sand",
					},
					"SOUL_SAND",
				],
				[
					{
						src: `${cdnUrl}/glowstone.png`,
						width: 30,
						height: 30,
						alt: "Glowstone",
					},
					"GLOWSTONE",
				],
				[
					{
						src: `${cdnUrl}/portal_placeholder.png`,
						width: 30,
						height: 30,
						alt: "Portal",
					},
					"PORTAL",
				],
				[
					{
						src: `${cdnUrl}/cake_top.png`,
						width: 30,
						height: 30,
						alt: "Cake",
					},
					"CAKE",
				],
				[
					{
						src: `${cdnUrl}/repeater_on.png`,
						width: 30,
						height: 30,
						alt: "Unpowered_repeater",
					},
					"UNPOWERED_REPEATER",
				],
				[
					{
						src: `${cdnUrl}/glass_white.png`,
						width: 30,
						height: 30,
						alt: "Stained_glass",
					},
					"STAINED_GLASS",
				],
				[
					{
						src: `${cdnUrl}/wooden_trapdoor.png`,
						width: 30,
						height: 30,
						alt: "Trapdoor",
					},
					"TRAPDOOR",
				],
				[
					{
						src: `${cdnUrl}/stonebrick.png`,
						width: 30,
						height: 30,
						alt: "Stonebrick",
					},
					"STONEBRICK",
				],
				[
					{
						src: `${cdnUrl}/mushroom_block_skin_brown.png`,
						width: 30,
						height: 30,
						alt: "Brown_mushroom_block",
					},
					"BROWN_MUSHROOM_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/mushroom_block_skin_red.png`,
						width: 30,
						height: 30,
						alt: "Red_mushroom_block",
					},
					"RED_MUSHROOM_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/iron_bars.png`,
						width: 30,
						height: 30,
						alt: "Iron_bars",
					},
					"IRON_BARS",
				],
				[
					{
						src: `${cdnUrl}/glass_pane_top.png`,
						width: 30,
						height: 30,
						alt: "Glass_pane",
					},
					"GLASS_PANE",
				],
				[
					{
						src: `${cdnUrl}/carried_waterlily.png`,
						width: 30,
						height: 30,
						alt: "Waterlily",
					},
					"WATERLILY",
				],
				[
					{
						src: `${cdnUrl}/enchanting_table_top.png`,
						width: 30,
						height: 30,
						alt: "Enchanting_table",
					},
					"ENCHANTING_TABLE",
				],
				[
					{
						src: `${cdnUrl}/brewing_stand.png`,
						width: 30,
						height: 30,
						alt: "Brewing_stand",
					},
					"BREWING_STAND",
				],
				[
					{
						src: `${cdnUrl}/endframe_top.png`,
						width: 30,
						height: 30,
						alt: "End_Portal",
					},
					"END_PORTAL",
				],
				[
					{
						src: `${cdnUrl}/dragon_egg.png`,
						width: 30,
						height: 30,
						alt: "Dragon_egg",
					},
					"DRAGON_EGG",
				],
				[
					{
						src: `${cdnUrl}/redstone_lamp_on.png`,
						width: 30,
						height: 30,
						alt: "Redstone_lamp",
					},
					"REDSTONE_LAMP",
				],
				[
					{
						src: `${cdnUrl}/emerald_ore.png`,
						width: 30,
						height: 30,
						alt: "Emerald_ore",
					},
					"EMERALD_ORE",
				],
				[
					{
						src: `${cdnUrl}/trip_wire_source.png`,
						width: 30,
						height: 30,
						alt: "Tripwire_hook",
					},
					"TRIPWIRE_HOOK",
				],
				[
					{
						src: `${cdnUrl}/trip_wire.png`,
						width: 30,
						height: 30,
						alt: "Tripwire",
					},
					"TRIPWIRE",
				],
				[
					{
						src: `${cdnUrl}/emerald_block.png`,
						width: 30,
						height: 30,
						alt: "Emerald_block",
					},
					"EMERALD_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/command_block.png`,
						width: 30,
						height: 30,
						alt: "Command Block",
					},
					"COMMAND_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/beacon.png`,
						width: 30,
						height: 30,
						alt: "Beacon",
					},
					"BEACON",
				],
				[
					{
						src: `${cdnUrl}/trapped_chest_front.png`,
						width: 30,
						height: 30,
						alt: "Trapped_Chest",
					},
					"TRAPPED_CHEST",
				],
				[
					{
						src: `${cdnUrl}/comparator_on.png`,
						width: 30,
						height: 30,
						alt: "Unpowered_comparator",
					},
					"UNPOWERED_COMPARATOR",
				],
				[
					{
						src: `${cdnUrl}/daylight_detector_top.png`,
						width: 30,
						height: 30,
						alt: "Daylight_detector",
					},
					"DAYLIGHT_DETECTOR",
				],
				[
					{
						src: `${cdnUrl}/redstone_block.png`,
						width: 30,
						height: 30,
						alt: "Redstone_block",
					},
					"REDSTONE_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/hopper_top.png`,
						width: 30,
						height: 30,
						alt: "Hopper",
					},
					"HOPPER",
				],
				[
					{
						src: `${cdnUrl}/quartz_ore.png`,
						width: 30,
						height: 30,
						alt: "Quartz_ore",
					},
					"QUARTZ_ORE",
				],
				[
					{
						src: `${cdnUrl}/quartz_block_top.png`,
						width: 30,
						height: 30,
						alt: "Quartz_block",
					},
					"QUARTZ_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/rail_activator.png`,
						width: 30,
						height: 30,
						alt: "Activator_rail",
					},
					"ACTIVATOR_RAIL",
				],
				[
					{
						src: `${cdnUrl}/dropper_front_horizontal.png`,
						width: 30,
						height: 30,
						alt: "Dropper",
					},
					"DROPPER",
				],

				[
					{
						src: `${cdnUrl}/slime.png`,
						width: 30,
						height: 30,
						alt: "Slime",
					},
					"SLIME",
				],
				[
					{
						src: `${cdnUrl}/barrier.png`,
						width: 30,
						height: 30,
						alt: "barrier",
					},
					"BARRIER",
				],
				[
					{
						src: `${cdnUrl}/iron_trapdoor.png`,
						width: 30,
						height: 30,
						alt: "Iron_trapdoor",
					},
					"IRON_TRAPDOOR",
				],

				[
					{
						src: `${cdnUrl}/hay_block_side.png`,
						width: 30,
						height: 30,
						alt: "Hay_block",
					},
					"HAY_BLOCK",
				],
				[
					{
						src: `${cdnUrl}/end_rod.png`,
						width: 30,
						height: 30,
						alt: "End_rod",
					},
					"END_ROD",
				],
				[
					{
						src: `${cdnUrl}/end_gateway.png`,
						width: 30,
						height: 30,
						alt: "End_Gateway",
					},
					"END_GATEWAY",
				],
				[
					{
						src: `${cdnUrl}/observer_front.png`,
						width: 30,
						height: 30,
						alt: "Observer",
					},
					"OBSERVER",
				],
				[
					{
						src: `${cdnUrl}/shulker_top_white.png`,
						width: 30,
						height: 30,
						alt: "White_shulker_box",
					},
					"WHITE_SHULKER_BOX",
				],
				[
					{
						src: `${cdnUrl}/concrete_white.png`,
						width: 30,
						height: 30,
						alt: "Concrete",
					},
					"CONCRETE",
				],
				[
					{
						src: `${cdnUrl}/concrete_powder_white.png`,
						width: 30,
						height: 30,
						alt: "Concrete_powder",
					},
					"CONCRETE_POWDER",
				],
				[
					{
						src: `${cdnUrl}/structure_block.png`,
						width: 30,
						height: 30,
						alt: "Structure_block",
					},
					"STRUCTURE_BLOCK",
				],
			],
		},
	],

	output: "Block",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_blockDropdown = (
		block,
		generator,
	) => {
		const dropdown = block.getFieldValue("BLOCK");
		return [dropdown, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_BLOCKDROPDOWN: " %1 Block",
	},
	ja: {
		MINECRAFT_VAR_BLOCKDROPDOWN: " %1 ブロック",
	},
} satisfies Locale;
