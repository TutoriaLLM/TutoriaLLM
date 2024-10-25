//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";
import { Order, javascriptGenerator } from "blockly/javascript";
import "@blockly/field-grid-dropdown";

export const block = {
	type: "ext_minecraft_var_blockDropdown",
	message0: "%{BKY_MINECRAFT_VAR_BLOCKDROPDOWN}",
	colour: "#a855f7",

	args0: [
		{
			type: "field_grid_dropdown",
			name: "BLOCK",
			options: [
				[
					{
						src: "/minecraft/structure_air.png",
						width: 30,
						height: 30,
						alt: "Air",
					},
					"AIR",
				],
				[
					{
						src: "/minecraft/stone.png",
						width: 30,
						height: 30,
						alt: "Stone",
					},
					"STONE",
				],
				[
					{
						src: "/minecraft/grass_block_side.png",
						width: 30,
						height: 30,
						alt: "Grass",
					},
					"GRASS",
				],
				[
					{
						src: "/minecraft/dirt.png",
						width: 30,
						height: 30,
						alt: "Dirt",
					},
					"DIRT",
				],
				[
					{
						src: "/minecraft/cobblestone.png",
						width: 30,
						height: 30,
						alt: "Cobblestone",
					},
					"COBBLESTONE",
				],
				[
					{
						src: "/minecraft/oak_planks.png",
						width: 30,
						height: 30,
						alt: "Planks",
					},
					"PLANKS",
				],
				[
					{
						src: "/minecraft/oak_sapling.png",
						width: 30,
						height: 30,
						alt: "Sapling",
					},
					"SAPLING",
				],
				[
					{
						src: "/minecraft/bedrock.png",
						width: 30,
						height: 30,
						alt: "Bedrock",
					},
					"BEDROCK",
				],
				[
					{
						src: "/minecraft/water_placeholder.png",
						width: 30,
						height: 30,
						alt: "Sand",
					},
					"WATER",
				],
				[
					{
						src: "/minecraft/lava_placeholder.png",
						width: 30,
						height: 30,
						alt: "Lava",
					},
					"LAVA",
				],
				[
					{
						src: "/minecraft/sand.png",
						width: 30,
						height: 30,
						alt: "Sand",
					},
					"SAND",
				],
				[
					{
						src: "/minecraft/gravel.png",
						width: 30,
						height: 30,
						alt: "Gravel",
					},
					"GRAVEL",
				],
				[
					{
						src: "/minecraft/gold_ore.png",
						width: 30,
						height: 30,
						alt: "Gold_ore",
					},
					"GOLD_ORE",
				],
				[
					{
						src: "/minecraft/iron_ore.png",
						width: 30,
						height: 30,
						alt: "Iron_ore",
					},
					"IRON_ORE",
				],
				[
					{
						src: "/minecraft/coal_ore.png",
						width: 30,
						height: 30,
						alt: "Coal_ore",
					},
					"COAL_ORE",
				],
				[
					{
						src: "/minecraft/oak_log.png",
						width: 30,
						height: 30,
						alt: "Log",
					},
					"LOG",
				],
				[
					{
						src: "/minecraft/oak_leaves.png",
						width: 30,
						height: 30,
						alt: "Leaves",
					},
					"LEAVES",
				],
				[
					{
						src: "/minecraft/sponge.png",
						width: 30,
						height: 30,
						alt: "Sponge",
					},
					"SPONGE",
				],
				[
					{
						src: "/minecraft/glass.png",
						width: 30,
						height: 30,
						alt: "Glass",
					},
					"GLASS",
				],
				[
					{
						src: "/minecraft/lapis_ore.png",
						width: 30,
						height: 30,
						alt: "Lapis_ore",
					},
					"LAPIS_ORE",
				],
				[
					{
						src: "/minecraft/lapis_block.png",
						width: 30,
						height: 30,
						alt: "Lapis_block",
					},
					"LAPIS_BLOCK",
				],
				[
					{
						src: "/minecraft/dispenser_front.png",
						width: 30,
						height: 30,
						alt: "Dispenser",
					},
					"DISPENSER",
				],
				[
					{
						src: "/minecraft/sandstone.png",
						width: 30,
						height: 30,
						alt: "Sandstone",
					},
					"SANDSTONE",
				],
				[
					{
						src: "/minecraft/note_block.png",
						width: 30,
						height: 30,
						alt: "Noteblock",
					},
					"NOTEBLOCK",
				],
				[
					{
						src: "/minecraft/bed_head_top.png",
						width: 30,
						height: 30,
						alt: "Bed",
					},
					"BED",
				],
				[
					{
						src: "/minecraft/powered_rail.png",
						width: 30,
						height: 30,
						alt: "Golden_rail",
					},
					"POWERED_RAIL",
				],
				[
					{
						src: "/minecraft/detector_rail.png",
						width: 30,
						height: 30,
						alt: "Detector_rail",
					},
					"DETECTOR_RAIL",
				],
				[
					{
						src: "/minecraft/piston_top_sticky.png",
						width: 30,
						height: 30,
						alt: "Sticky_piston",
					},
					"STICKY_PISTON",
				],

				[
					{
						src: "/minecraft/piston_top.png",
						width: 30,
						height: 30,
						alt: "Piston",
					},
					"PISTON",
				],
				[
					{
						src: "/minecraft/white_wool.png",
						width: 30,
						height: 30,
						alt: "Wool",
					},
					"WOOL",
				],
				[
					{
						src: "/minecraft/poppy.png",
						width: 30,
						height: 30,
						alt: "Red_flower",
					},
					"RED_FLOWER",
				],
				[
					{
						src: "/minecraft/brown_mushroom.png",
						width: 30,
						height: 30,
						alt: "Brown_mushroom",
					},
					"BROWN_MUSHROOM",
				],
				[
					{
						src: "/minecraft/red_mushroom.png",
						width: 30,
						height: 30,
						alt: "Red_mushroom",
					},
					"RED_MUSHROOM",
				],
				[
					{
						src: "/minecraft/gold_block.png",
						width: 30,
						height: 30,
						alt: "Gold_block",
					},
					"GOLD_BLOCK",
				],
				[
					{
						src: "/minecraft/iron_block.png",
						width: 30,
						height: 30,
						alt: "Iron_block",
					},
					"IRON_BLOCK",
				],
				[
					{
						src: "/minecraft/bricks.png",
						width: 30,
						height: 30,
						alt: "Brick_block",
					},
					"BRICK_BLOCK",
				],
				[
					{
						src: "/minecraft/tnt_top.png",
						width: 30,
						height: 30,
						alt: "Tnt",
					},
					"TNT",
				],
				[
					{
						src: "/minecraft/bookshelf.png",
						width: 30,
						height: 30,
						alt: "Bookshelf",
					},
					"BOOKSHELF",
				],
				[
					{
						src: "/minecraft/mossy_cobblestone.png",
						width: 30,
						height: 30,
						alt: "Mossy_cobblestone",
					},
					"MOSSY_COBBLESTONE",
				],
				[
					{
						src: "/minecraft/obsidian.png",
						width: 30,
						height: 30,
						alt: "Obsidian",
					},
					"OBSIDIAN",
				],
				[
					{
						src: "/minecraft/torch.png",
						width: 30,
						height: 30,
						alt: "Torch",
					},
					"TORCH",
				],
				[
					{
						src: "/minecraft/fire_0_placeholder.png",
						width: 30,
						height: 30,
						alt: "Fire",
					},
					"FIRE",
				],
				[
					{
						src: "/minecraft/redstone_dust.png",
						width: 30,
						height: 30,
						alt: "Redstone_wire",
					},
					"REDSTONE_WIRE",
				],
				[
					{
						src: "/minecraft/diamond_ore.png",
						width: 30,
						height: 30,
						alt: "Diamond_ore",
					},
					"DIAMOND_ORE",
				],
				[
					{
						src: "/minecraft/diamond_block.png",
						width: 30,
						height: 30,
						alt: "Diamond_block",
					},
					"DIAMOND_BLOCK",
				],
				[
					{
						src: "/minecraft/crafting_table_top.png",
						width: 30,
						height: 30,
						alt: "Crafting_table",
					},
					"CRAFTING_TABLE",
				],
				[
					{
						src: "/minecraft/furnace_front.png",
						width: 30,
						height: 30,
						alt: "Furnace",
					},
					"FURNACE",
				],
				[
					{
						src: "/minecraft/oak_door_top.png",
						width: 30,
						height: 30,
						alt: "Wooden_door",
					},
					"WOODEN_DOOR",
				],
				[
					{
						src: "/minecraft/ladder.png",
						width: 30,
						height: 30,
						alt: "Ladder",
					},
					"LADDER",
				],
				[
					{
						src: "/minecraft/rail.png",
						width: 30,
						height: 30,
						alt: "Rail",
					},
					"RAIL",
				],
				[
					{
						src: "/minecraft/lever.png",
						width: 30,
						height: 30,
						alt: "Lever",
					},
					"LEVER",
				],
				[
					{
						src: "/minecraft/stone_pressure_plate.png",
						width: 30,
						height: 30,
						alt: "Stone_Pressure_Plate",
					},
					"STONE_PRESSURE_PLATE",
				],
				[
					{
						src: "/minecraft/iron_door_top.png",
						width: 30,
						height: 30,
						alt: "Iron_door",
					},
					"IRON_DOOR",
				],
				[
					{
						src: "/minecraft/redstone_ore.png",
						width: 30,
						height: 30,
						alt: "Redstone_ore",
					},
					"REDSTONE_ORE",
				],
				[
					{
						src: "/minecraft/redstone_torch.png",
						width: 30,
						height: 30,
						alt: "Redstone_torch",
					},
					"REDSTONE_TORCH",
				],
				[
					{
						src: "/minecraft/stone_button.png",
						width: 30,
						height: 30,
						alt: "Stone_button",
					},
					"STONE_BUTTON",
				],
				[
					{
						src: "/minecraft/ice.png",
						width: 30,
						height: 30,
						alt: "Ice",
					},
					"ICE",
				],
				[
					{
						src: "/minecraft/snow.png",
						width: 30,
						height: 30,
						alt: "Snow",
					},
					"SNOW",
				],
				[
					{
						src: "/minecraft/cactus_side.png",
						width: 30,
						height: 30,
						alt: "Cactus",
					},
					"CACTUS",
				],
				[
					{
						src: "/minecraft/clay.png",
						width: 30,
						height: 30,
						alt: "Clay",
					},
					"CLAY",
				],
				[
					{
						src: "/minecraft/jukebox_top.png",
						width: 30,
						height: 30,
						alt: "Jukebox",
					},
					"JUKEBOX",
				],
				[
					{
						src: "/minecraft/oak_fence.png",
						width: 30,
						height: 30,
						alt: "Oak_Fence",
					},

					"OAK_FENCE",
				],
				[
					{
						src: "/minecraft/netherrack.png",
						width: 30,
						height: 30,
						alt: "Netherrack",
					},
					"NETHERRACK",
				],
				[
					{
						src: "/minecraft/soul_sand.png",
						width: 30,
						height: 30,
						alt: "Soul_sand",
					},
					"SOUL_SAND",
				],
				[
					{
						src: "/minecraft/glowstone.png",
						width: 30,
						height: 30,
						alt: "Glowstone",
					},
					"GLOWSTONE",
				],
				[
					{
						src: "/minecraft/nether_portal.png",
						width: 30,
						height: 30,
						alt: "Portal",
					},
					"PORTAL",
				],
				[
					{
						src: "/minecraft/cake_top.png",
						width: 30,
						height: 30,
						alt: "Cake",
					},
					"CAKE",
				],
				[
					{
						src: "/minecraft/repeater.png",
						width: 30,
						height: 30,
						alt: "Unpowered_repeater",
					},
					"UNPOWERED_REPEATER",
				],
				[
					{
						src: "/minecraft/white_stained_glass.png",
						width: 30,
						height: 30,
						alt: "Stained_glass",
					},
					"STAINED_GLASS",
				],
				[
					{
						src: "/minecraft/oak_trapdoor.png",
						width: 30,
						height: 30,
						alt: "Trapdoor",
					},
					"TRAPDOOR",
				],
				[
					{
						src: "/minecraft/stone_bricks.png",
						width: 30,
						height: 30,
						alt: "Stonebrick",
					},
					"STONEBRICK",
				],
				[
					{
						src: "/minecraft/brown_mushroom_block.png",
						width: 30,
						height: 30,
						alt: "Brown_mushroom_block",
					},
					"BROWN_MUSHROOM_BLOCK",
				],
				[
					{
						src: "/minecraft/red_mushroom_block.png",
						width: 30,
						height: 30,
						alt: "Red_mushroom_block",
					},
					"RED_MUSHROOM_BLOCK",
				],
				[
					{
						src: "/minecraft/iron_bars.png",
						width: 30,
						height: 30,
						alt: "Iron_bars",
					},
					"IRON_BARS",
				],
				[
					{
						src: "/minecraft/glass_pane_top.png",
						width: 30,
						height: 30,
						alt: "Glass_pane",
					},
					"GLASS_PANE",
				],
				[
					{
						src: "/minecraft/bamboo_fence_gate.png",
						width: 30,
						height: 30,
						alt: "Fence_gate",
					},
					"FENCE_GATE",
				],

				[
					{
						src: "/minecraft/lily_pad.png",
						width: 30,
						height: 30,
						alt: "Waterlily",
					},
					"WATERLILY",
				],
				[
					{
						src: "/minecraft/enchanting_table_top.png",
						width: 30,
						height: 30,
						alt: "Enchanting_table",
					},
					"ENCHANTING_TABLE",
				],
				[
					{
						src: "/minecraft/brewing_stand.png",
						width: 30,
						height: 30,
						alt: "Brewing_stand",
					},
					"BREWING_STAND",
				],
				[
					{
						src: "/minecraft/end_portal_frame_top.png",
						width: 30,
						height: 30,
						alt: "End_Portal",
					},
					"END_PORTAL",
				],
				[
					{
						src: "/minecraft/dragon_egg.png",
						width: 30,
						height: 30,
						alt: "Dragon_egg",
					},
					"DRAGON_EGG",
				],
				[
					{
						src: "/minecraft/redstone_lamp.png",
						width: 30,
						height: 30,
						alt: "Redstone_lamp",
					},
					"REDSTONE_LAMP",
				],
				[
					{
						src: "/minecraft/emerald_ore.png",
						width: 30,
						height: 30,
						alt: "Emerald_ore",
					},
					"EMERALD_ORE",
				],
				[
					{
						src: "/minecraft/tripwire_hook.png",
						width: 30,
						height: 30,
						alt: "Tripwire_hook",
					},
					"TRIPWIRE_HOOK",
				],
				[
					{
						src: "/minecraft/tripwire.png",
						width: 30,
						height: 30,
						alt: "Tripwire",
					},
					"TRIPWIRE",
				],
				[
					{
						src: "/minecraft/emerald_block.png",
						width: 30,
						height: 30,
						alt: "Emerald_block",
					},
					"EMERALD_BLOCK",
				],
				[
					{
						src: "/minecraft/command_block.png",
						width: 30,
						height: 30,
						alt: "Command Block",
					},
					"COMMAND_BLOCK",
				],
				[
					{
						src: "/minecraft/beacon.png",
						width: 30,
						height: 30,
						alt: "Beacon",
					},
					"BEACON",
				],
				[
					{
						src: "/minecraft/oak_button.png",
						width: 30,
						height: 30,
						alt: "Oak_Button",
					},
					"oak_button",
				],
				[
					{
						src: "/minecraft/trapped_chest_front.png",
						width: 30,
						height: 30,
						alt: "Trapped_Chest",
					},
					"TRAPPED_CHEST",
				],
				[
					{
						src: "/minecraft/comparator.png",
						width: 30,
						height: 30,
						alt: "Unpowered_comparator",
					},
					"UNPOWERED_COMPARATOR",
				],
				[
					{
						src: "/minecraft/daylight_detector_top.png",
						width: 30,
						height: 30,
						alt: "Daylight_detector",
					},
					"DAYLIGHT_DETECTOR",
				],
				[
					{
						src: "/minecraft/redstone_block.png",
						width: 30,
						height: 30,
						alt: "Redstone_block",
					},
					"REDSTONE_BLOCK",
				],
				[
					{
						src: "/minecraft/hopper_top.png",
						width: 30,
						height: 30,
						alt: "Hopper",
					},
					"HOPPER",
				],
				[
					{
						src: "/minecraft/nether_quartz_ore.png",
						width: 30,
						height: 30,
						alt: "Quartz_ore",
					},
					"QUARTZ_ORE",
				],
				[
					{
						src: "/minecraft/quartz_block_top.png",
						width: 30,
						height: 30,
						alt: "Quartz_block",
					},
					"QUARTZ_BLOCK",
				],
				[
					{
						src: "/minecraft/activator_rail.png",
						width: 30,
						height: 30,
						alt: "Activator_rail",
					},
					"ACTIVATOR_RAIL",
				],
				[
					{
						src: "/minecraft/dropper_front.png",
						width: 30,
						height: 30,
						alt: "Dropper",
					},
					"DROPPER",
				],

				[
					{
						src: "/minecraft/slime_block.png",
						width: 30,
						height: 30,
						alt: "Slime",
					},
					"SLIME",
				],
				[
					{
						src: "/minecraft/barrier.png",
						width: 30,
						height: 30,
						alt: "barrier",
					},
					"BARRIER",
				],
				[
					{
						src: "/minecraft/iron_trapdoor.png",
						width: 30,
						height: 30,
						alt: "Iron_trapdoor",
					},
					"IRON_TRAPDOOR",
				],

				[
					{
						src: "/minecraft/hay_block_side.png",
						width: 30,
						height: 30,
						alt: "Hay_block",
					},
					"HAY_BLOCK",
				],
				[
					{
						src: "/minecraft/end_rod.png",
						width: 30,
						height: 30,
						alt: "End_rod",
					},
					"END_ROD",
				],
				[
					{
						src: "/minecraft/end_gateway.png",
						width: 30,
						height: 30,
						alt: "End_Gateway",
					},
					"END_GATEWAY",
				],
				[
					{
						src: "/minecraft/observer_front.png",
						width: 30,
						height: 30,
						alt: "Observer",
					},
					"OBSERVER",
				],
				[
					{
						src: "/minecraft/white_shulker_box.png",
						width: 30,
						height: 30,
						alt: "White_shulker_box",
					},
					"WHITE_SHULKER_BOX",
				],
				[
					{
						src: "/minecraft/white_concrete.png",
						width: 30,
						height: 30,
						alt: "Concrete",
					},
					"CONCRETE",
				],
				[
					{
						src: "/minecraft/white_concrete_powder.png",
						width: 30,
						height: 30,
						alt: "Concrete_powder",
					},
					"CONCRETE_POWDER",
				],
				[
					{
						src: "/minecraft/structure_block.png",
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
};

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
};
