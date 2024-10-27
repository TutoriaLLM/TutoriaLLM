//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";
import { Order, javascriptGenerator } from "blockly/javascript";
import "@blockly/field-grid-dropdown";

export const block = {
	type: "ext_minecraft_var_toolsDropdown",
	message0: "%{BKY_MINECRAFT_VAR_TOOLSDROPDOWN}",
	colour: "#22c55e",

	args0: [
		{
			type: "field_grid_dropdown",
			name: "ITEM",
			options: [
				[
					{
						src: "/minecraft/fishing_rod_uncast.png",
						width: 30,
						height: 30,
						alt: "Fishing Rod",
					},
					"FISHING_ROD",
				],
				[
					{
						src: "/minecraft/stick.png",
						width: 30,
						height: 30,
						alt: "Stick",
					},
					"STICK",
				],
				[
					{
						src: "/minecraft/apple.png",
						width: 30,
						height: 30,
						alt: "Apple",
					},
					"APPLE",
				],
				[
					{
						src: "/minecraft/bow_standby.png",
						width: 30,
						height: 30,
						alt: "Bow",
					},
					"BOW",
				],
				[
					{
						src: "/minecraft/fireworks.png",
						width: 30,
						height: 30,
						alt: "Firework Rocket",
					},
					"FIREWORK_ROCKET",
				],
				[
					{
						src: "/minecraft/flint_and_steel.png",
						width: 30,
						height: 30,
						alt: "Flint and Steel",
					},
					"FLINT_AND_STEEL",
				],
				[
					{
						src: "/minecraft/spyglass.png",
						width: 30,
						height: 30,
						alt: "Spyglass",
					},
					"SPYGLASS",
				],
				[
					{
						src: "/minecraft/wood_axe.png",
						width: 30,
						height: 30,
						alt: "Wooden Axe",
					},
					"WOODEN_AXE",
				],
				[
					{
						src: "/minecraft/stone_axe.png",
						width: 30,
						height: 30,
						alt: "Stone Axe",
					},
					"STONE_AXE",
				],
				[
					{
						src: "/minecraft/iron_axe.png",
						width: 30,
						height: 30,
						alt: "Iron Axe",
					},
					"IRON_AXE",
				],
				[
					{
						src: "/minecraft/diamond_axe.png",
						width: 30,
						height: 30,
						alt: "Diamond Axe",
					},
					"DIAMOND_AXE",
				],
				[
					{
						src: "/minecraft/gold_axe.png",
						width: 30,
						height: 30,
						alt: "Golden Axe",
					},
					"GOLDEN_AXE",
				],
				[
					{
						src: "/minecraft/netherite_axe.png",
						width: 30,
						height: 30,
						alt: "Netherite Axe",
					},
					"NETHERITE_AXE",
				],
				[
					{
						src: "/minecraft/wood_shovel.png",
						width: 30,
						height: 30,
						alt: "Wooden Shovel",
					},
					"WOODEN_SHOVEL",
				],
				[
					{
						src: "/minecraft/stone_shovel.png",
						width: 30,
						height: 30,
						alt: "Stone Shovel",
					},
					"STONE_SHOVEL",
				],
				[
					{
						src: "/minecraft/iron_shovel.png",
						width: 30,
						height: 30,
						alt: "Iron Shovel",
					},
					"IRON_SHOVEL",
				],
				[
					{
						src: "/minecraft/diamond_shovel.png",
						width: 30,
						height: 30,
						alt: "Diamond Shovel",
					},
					"DIAMOND_SHOVEL",
				],
				[
					{
						src: "/minecraft/gold_shovel.png",
						width: 30,
						height: 30,
						alt: "Golden Shovel",
					},
					"GOLDEN_SHOVEL",
				],
				[
					{
						src: "/minecraft/netherite_shovel.png",
						width: 30,
						height: 30,
						alt: "Netherite Shovel",
					},
					"NETHERITE_SHOVEL",
				],
				[
					{
						src: "/minecraft/wood_pickaxe.png",
						width: 30,
						height: 30,
						alt: "Wooden Pickaxe",
					},
					"WOODEN_PICKAXE",
				],
				[
					{
						src: "/minecraft/stone_pickaxe.png",
						width: 30,
						height: 30,
						alt: "Stone Pickaxe",
					},
					"STONE_PICKAXE",
				],
				[
					{
						src: "/minecraft/iron_pickaxe.png",
						width: 30,
						height: 30,
						alt: "Iron Pickaxe",
					},
					"IRON_PICKAXE",
				],
				[
					{
						src: "/minecraft/diamond_pickaxe.png",
						width: 30,
						height: 30,
						alt: "Diamond Pickaxe",
					},
					"DIAMOND_PICKAXE",
				],
				[
					{
						src: "/minecraft/gold_pickaxe.png",
						width: 30,
						height: 30,
						alt: "Golden Pickaxe",
					},
					"GOLDEN_PICKAXE",
				],
				[
					{
						src: "/minecraft/netherite_pickaxe.png",
						width: 30,
						height: 30,
						alt: "Netherite Pickaxe",
					},
					"NETHERITE_PICKAXE",
				],
				[
					{
						src: "/minecraft/wood_hoe.png",
						width: 30,
						height: 30,
						alt: "Wooden Hoe",
					},
					"WOODEN_HOE",
				],
				[
					{
						src: "/minecraft/stone_hoe.png",
						width: 30,
						height: 30,
						alt: "Stone Hoe",
					},
					"STONE_HOE",
				],
				[
					{
						src: "/minecraft/iron_hoe.png",
						width: 30,
						height: 30,
						alt: "Iron Hoe",
					},
					"IRON_HOE",
				],
				[
					{
						src: "/minecraft/diamond_hoe.png",
						width: 30,
						height: 30,
						alt: "Diamond Hoe",
					},
					"DIAMOND_HOE",
				],
				[
					{
						src: "/minecraft/gold_hoe.png",
						width: 30,
						height: 30,
						alt: "Golden Hoe",
					},
					"GOLDEN_HOE",
				],
				[
					{
						src: "/minecraft/netherite_hoe.png",
						width: 30,
						height: 30,
						alt: "Netherite Hoe",
					},
					"NETHERITE_HOE",
				],
				[
					{
						src: "/minecraft/wood_sword.png",
						width: 30,
						height: 30,
						alt: "Wooden Sword",
					},
					"WOODEN_SWORD",
				],
				[
					{
						src: "/minecraft/stone_sword.png",
						width: 30,
						height: 30,
						alt: "Stone Sword",
					},
					"STONE_SWORD",
				],
				[
					{
						src: "/minecraft/iron_sword.png",
						width: 30,
						height: 30,
						alt: "Iron Sword",
					},
					"IRON_SWORD",
				],
				[
					{
						src: "/minecraft/diamond_sword.png",
						width: 30,
						height: 30,
						alt: "Diamond Sword",
					},
					"DIAMOND_SWORD",
				],
				[
					{
						src: "/minecraft/gold_sword.png",
						width: 30,
						height: 30,
						alt: "Golden Sword",
					},
					"GOLDEN_SWORD",
				],
				[
					{
						src: "/minecraft/netherite_sword.png",
						width: 30,
						height: 30,
						alt: "Netherite Sword",
					},
					"NETHERITE_SWORD",
				],
			],
		},
	],

	output: "Item",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_toolsDropdown = (
		block,
		generator,
	) => {
		const dropdown = block.getFieldValue("ITEM");
		return [dropdown, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_TOOLSDROPDOWN: "Tools %1",
	},
	ja: {
		MINECRAFT_VAR_TOOLSDROPDOWN: "道具 %1",
	},
};
