//Minecraftのブロックのドロップダウンimport { Order, javascriptGenerator } from "blockly/javascript";
import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";
import "@blockly/field-grid-dropdown";

const cdnUrl =
	"https://cdn.jsdelivr.net/gh/Tutoriallm/bedrock-samples@main/resource_pack/textures/items";

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
						src: `${cdnUrl}/fishing_rod_uncast.png`,
						width: 30,
						height: 30,
						alt: "Fishing Rod",
					},
					"FISHING_ROD",
				],
				[
					{
						src: `${cdnUrl}/stick.png`,
						width: 30,
						height: 30,
						alt: "Stick",
					},
					"STICK",
				],
				[
					{
						src: `${cdnUrl}/apple.png`,
						width: 30,
						height: 30,
						alt: "Apple",
					},
					"APPLE",
				],
				[
					{
						src: `${cdnUrl}/bow_standby.png`,
						width: 30,
						height: 30,
						alt: "Bow",
					},
					"BOW",
				],
				[
					{
						src: `${cdnUrl}/fireworks.png`,
						width: 30,
						height: 30,
						alt: "Firework Rocket",
					},
					"FIREWORK_ROCKET",
				],
				[
					{
						src: `${cdnUrl}/flint_and_steel.png`,
						width: 30,
						height: 30,
						alt: "Flint and Steel",
					},
					"FLINT_AND_STEEL",
				],
				[
					{
						src: `${cdnUrl}/spyglass.png`,
						width: 30,
						height: 30,
						alt: "Spyglass",
					},
					"SPYGLASS",
				],
				[
					{
						src: `${cdnUrl}/wood_axe.png`,
						width: 30,
						height: 30,
						alt: "Wooden Axe",
					},
					"WOODEN_AXE",
				],
				[
					{
						src: `${cdnUrl}/stone_axe.png`,
						width: 30,
						height: 30,
						alt: "Stone Axe",
					},
					"STONE_AXE",
				],
				[
					{
						src: `${cdnUrl}/iron_axe.png`,
						width: 30,
						height: 30,
						alt: "Iron Axe",
					},
					"IRON_AXE",
				],
				[
					{
						src: `${cdnUrl}/diamond_axe.png`,
						width: 30,
						height: 30,
						alt: "Diamond Axe",
					},
					"DIAMOND_AXE",
				],
				[
					{
						src: `${cdnUrl}/gold_axe.png`,
						width: 30,
						height: 30,
						alt: "Golden Axe",
					},
					"GOLDEN_AXE",
				],
				[
					{
						src: `${cdnUrl}/netherite_axe.png`,
						width: 30,
						height: 30,
						alt: "Netherite Axe",
					},
					"NETHERITE_AXE",
				],
				[
					{
						src: `${cdnUrl}/wood_shovel.png`,
						width: 30,
						height: 30,
						alt: "Wooden Shovel",
					},
					"WOODEN_SHOVEL",
				],
				[
					{
						src: `${cdnUrl}/stone_shovel.png`,
						width: 30,
						height: 30,
						alt: "Stone Shovel",
					},
					"STONE_SHOVEL",
				],
				[
					{
						src: `${cdnUrl}/iron_shovel.png`,
						width: 30,
						height: 30,
						alt: "Iron Shovel",
					},
					"IRON_SHOVEL",
				],
				[
					{
						src: `${cdnUrl}/diamond_shovel.png`,
						width: 30,
						height: 30,
						alt: "Diamond Shovel",
					},
					"DIAMOND_SHOVEL",
				],
				[
					{
						src: `${cdnUrl}/gold_shovel.png`,
						width: 30,
						height: 30,
						alt: "Golden Shovel",
					},
					"GOLDEN_SHOVEL",
				],
				[
					{
						src: `${cdnUrl}/netherite_shovel.png`,
						width: 30,
						height: 30,
						alt: "Netherite Shovel",
					},
					"NETHERITE_SHOVEL",
				],
				[
					{
						src: `${cdnUrl}/wood_pickaxe.png`,
						width: 30,
						height: 30,
						alt: "Wooden Pickaxe",
					},
					"WOODEN_PICKAXE",
				],
				[
					{
						src: `${cdnUrl}/stone_pickaxe.png`,
						width: 30,
						height: 30,
						alt: "Stone Pickaxe",
					},
					"STONE_PICKAXE",
				],
				[
					{
						src: `${cdnUrl}/iron_pickaxe.png`,
						width: 30,
						height: 30,
						alt: "Iron Pickaxe",
					},
					"IRON_PICKAXE",
				],
				[
					{
						src: `${cdnUrl}/diamond_pickaxe.png`,
						width: 30,
						height: 30,
						alt: "Diamond Pickaxe",
					},
					"DIAMOND_PICKAXE",
				],
				[
					{
						src: `${cdnUrl}/gold_pickaxe.png`,
						width: 30,
						height: 30,
						alt: "Golden Pickaxe",
					},
					"GOLDEN_PICKAXE",
				],
				[
					{
						src: `${cdnUrl}/netherite_pickaxe.png`,
						width: 30,
						height: 30,
						alt: "Netherite Pickaxe",
					},
					"NETHERITE_PICKAXE",
				],
				[
					{
						src: `${cdnUrl}/wood_hoe.png`,
						width: 30,
						height: 30,
						alt: "Wooden Hoe",
					},
					"WOODEN_HOE",
				],
				[
					{
						src: `${cdnUrl}/stone_hoe.png`,
						width: 30,
						height: 30,
						alt: "Stone Hoe",
					},
					"STONE_HOE",
				],
				[
					{
						src: `${cdnUrl}/iron_hoe.png`,
						width: 30,
						height: 30,
						alt: "Iron Hoe",
					},
					"IRON_HOE",
				],
				[
					{
						src: `${cdnUrl}/diamond_hoe.png`,
						width: 30,
						height: 30,
						alt: "Diamond Hoe",
					},
					"DIAMOND_HOE",
				],
				[
					{
						src: `${cdnUrl}/gold_hoe.png`,
						width: 30,
						height: 30,
						alt: "Golden Hoe",
					},
					"GOLDEN_HOE",
				],
				[
					{
						src: `${cdnUrl}/netherite_hoe.png`,
						width: 30,
						height: 30,
						alt: "Netherite Hoe",
					},
					"NETHERITE_HOE",
				],
				[
					{
						src: `${cdnUrl}/wood_sword.png`,
						width: 30,
						height: 30,
						alt: "Wooden Sword",
					},
					"WOODEN_SWORD",
				],
				[
					{
						src: `${cdnUrl}/stone_sword.png`,
						width: 30,
						height: 30,
						alt: "Stone Sword",
					},
					"STONE_SWORD",
				],
				[
					{
						src: `${cdnUrl}/iron_sword.png`,
						width: 30,
						height: 30,
						alt: "Iron Sword",
					},
					"IRON_SWORD",
				],
				[
					{
						src: `${cdnUrl}/diamond_sword.png`,
						width: 30,
						height: 30,
						alt: "Diamond Sword",
					},
					"DIAMOND_SWORD",
				],
				[
					{
						src: `${cdnUrl}/gold_sword.png`,
						width: 30,
						height: 30,
						alt: "Golden Sword",
					},
					"GOLDEN_SWORD",
				],
				[
					{
						src: `${cdnUrl}/netherite_sword.png`,
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
} satisfies Block;

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
} satisfies Locale;
