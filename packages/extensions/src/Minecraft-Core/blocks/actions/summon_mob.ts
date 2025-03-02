import { Order, javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";
export const block = {
	type: "ext_minecraft_summon_mob",
	message0: "%{BKY_MINECRAFT_SUMMONMOB}",
	args0: [
		{
			type: "field_dropdown",
			name: "MOB",
			options: [
				["%{BKY_ALLAY}", "ALLAY"],
				["%{BKY_ARMADILLO}", "ARMADILLO"],
				["%{BKY_AXOLOTL}", "AXOLOTL"],
				["%{BKY_BAT}", "BAT"],
				["%{BKY_CAMEL}", "CAMEL"],
				["%{BKY_CAT}", "CAT"],
				["%{BKY_CHICKEN}", "CHICKEN"],
				["%{BKY_COD}", "COD"],
				["%{BKY_COW}", "COW"],
				["%{BKY_DONKEY}", "DONKEY"],
				["%{BKY_FROG}", "FROG"],
				["%{BKY_GLOW_SQUID}", "GLOW_SQUID"],
				["%{BKY_HORSE}", "HORSE"],
				["%{BKY_MOOSHROOM}", "MOOSHROOM"],
				["%{BKY_MULE}", "MULE"],
				["%{BKY_OCELOT}", "OCELOT"],
				["%{BKY_PARROT}", "PARROT"],
				["%{BKY_PIG}", "PIG"],
				["%{BKY_PUFFERFISH_DEFENSIVE}", "PUFFERFISH_DEFENSIVE"],
				["%{BKY_RABBIT}", "RABBIT"],
				["%{BKY_SALMON}", "SALMON"],
				["%{BKY_SHEEP}", "SHEEP"],
				["%{BKY_SKELETON_HORSE}", "SKELETON_HORSE"],
				["%{BKY_SNIFFER}", "SNIFFER"],
				["%{BKY_SNOW_GOLEM}", "SNOW_GOLEM"],
				["%{BKY_SQUID}", "SQUID"],
				["%{BKY_STRIDER}", "STRIDER"],
				["%{BKY_TADPOLE}", "TADPOLE"],
				["%{BKY_TROPICAL_FISH}", "TROPICAL_FISH"],
				["%{BKY_TURTLE}", "TURTLE"],
				["%{BKY_VILLAGER}", "VILLAGER"],
				["%{BKY_WANDERING_TRADER}", "WANDERING_TRADER"],
			],
		},
		{
			type: "input_value",
			name: "POS", //positionは {x: number, y: number, z: number} という形式のオブジェクト（パースする必要あり）
			check: "Position",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#d97706",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_summon_mob = (
		block,
		generator,
	) => {
		//dropdown
		const dropdown = block.getFieldValue("MOB");
		//pos
		const position = generator.valueToCode(block, "POS", Order.ATOMIC);
		const code = /* javascript */ `
				function summonMob() {
					const position = ${position};
					const messageToSend = commandMsg("/summon ${dropdown} " + position.x + " " + position.y + " " + position.z);
				wss.send(JSON.stringify(messageToSend));
				}
				summonMob();
				`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SUMMONMOB: "生き物 %1 を座標 %2 に召喚する",
		ALLAY: "アレイ",
		ARMADILLO: "アルマジロ",
		AXOLOTL: "ウーパールーパー",
		BAT: "コウモリ",
		CAMEL: "ラクダ",
		CAT: "ネコ",
		CHICKEN: "ニワトリ",
		COD: "タラ",
		COW: "ウシ",
		DONKEY: "ロバ",
		FROG: "カエル",
		GLOW_SQUID: "グロウスクイッド",
		HORSE: "ウマ",
		MOOSHROOM: "ムーシュルーム",
		MULE: "ラバ",
		OCELOT: "オセロット",
		PARROT: "オウム",
		PIG: "ブタ",
		PUFFERFISH_DEFENSIVE: "ハリセンボン (防御)",
		RABBIT: "ウサギ",
		SALMON: "サケ",
		SHEEP: "ヒツジ",
		SKELETON_HORSE: "スケルトンホース",
		SNIFFER: "スニッファー",
		SNOW_GOLEM: "スノーゴーレム",
		SQUID: "イカ",
		STRIDER: "ストライダー",
		TADPOLE: "オタマジャクシ",
		TROPICAL_FISH: "トロピカルフィッシュ",
		TURTLE: "カメ",
		VILLAGER: "村人",
		WANDERING_TRADER: "行商人",
	},
	en: {
		MINECRAFT_SUMMONMOB: "Summon %1 at %2",
		ALLAY: "Allay",
		ARMADILLO: "Armadillo",
		AXOLOTL: "Axolotl",
		BAT: "Bat",
		CAMEL: "Camel",
		CAT: "Cat",
		CHICKEN: "Chicken",
		COD: "Cod",
		COW: "Cow",
		DONKEY: "Donkey",
		FROG: "Frog",
		GLOW_SQUID: "Glow Squid",
		HORSE: "Horse",
		MOOSHROOM: "Mooshroom",
		MULE: "Mule",
		OCELOT: "Ocelot",
		PARROT: "Parrot",
		PIG: "Pig",
		PUFFERFISH_DEFENSIVE: "Pufferfish (defensive)",
		RABBIT: "Rabbit",
		SALMON: "Salmon",
		SHEEP: "Sheep",
		SKELETON_HORSE: "Skeleton Horse",
		SNIFFER: "Sniffer",
		SNOW_GOLEM: "Snow Golem",
		SQUID: "Squid",
		STRIDER: "Strider",
		TADPOLE: "Tadpole",
		TROPICAL_FISH: "Tropical Fish",
		TURTLE: "Turtle",
		VILLAGER: "Villager",
		WANDERING_TRADER: "Wandering Trader",
	},
} satisfies Locale;
