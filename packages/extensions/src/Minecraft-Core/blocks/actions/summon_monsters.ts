import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_summon_monster",
	message0: "%{BKY_MINECRAFT_SUMMONMONSTER}",
	args0: [
		{
			type: "field_dropdown",
			name: "MONSTER",
			options: [
				["%{BKY_BLAZE}", "BLAZE"],
				//["%{BKY_BOGGED}", "BOGGED"],
				//["%{BKY_BREEZE}", "BREEZE"],
				["%{BKY_CREEPER}", "CREEPER"],
				["%{BKY_ELDER_GUARDIAN}", "ELDER_GUARDIAN"],
				["%{BKY_ENDERMITE}", "ENDERMITE"],
				["%{BKY_ENDER_DRAGON}", "ENDER_DRAGON"],
				["%{BKY_EVOKER}", "EVOKER"],
				["%{BKY_GHAST}", "GHAST"],
				["%{BKY_GUARDIAN}", "GUARDIAN"],
				["%{BKY_HOGLIN}", "HOGLIN"],
				["%{BKY_HUSK}", "HUSK"],
				["%{BKY_MAGMA_CUBE}", "MAGMA_CUBE"],
				["%{BKY_PHANTOM}", "PHANTOM"],
				["%{BKY_PIGLIN_BRUTE}", "PIGLIN_BRUTE"],
				["%{BKY_PILLAGER}", "PILLAGER"],
				["%{BKY_RAVAGER}", "RAVAGER"],
				["%{BKY_SHULKER}", "SHULKER"],
				["%{BKY_SILVERFISH}", "SILVERFISH"],
				["%{BKY_SKELETON}", "SKELETON"],
				["%{BKY_SLIME}", "SLIME"],
				["%{BKY_STRAY}", "STRAY"],
				["%{BKY_VEX}", "VEX"],
				["%{BKY_VINDICATOR}", "VINDICATOR"],
				["%{BKY_WARDEN}", "WARDEN"],
				["%{BKY_WITCH}", "WITCH"],
				["%{BKY_WITHER}", "WITHER"],
				["%{BKY_WITHER_SKELETON}", "WITHER_SKELETON"],
				["%{BKY_ZOGLIN}", "ZOGLIN"],
				["%{BKY_ZOMBIE}", "ZOMBIE"],
				["%{BKY_ZOMBIE_VILLAGER}", "ZOMBIE_VILLAGER"],
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
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_summon_monster = (
		block,
		generator,
	) => {
		//dropdown
		const dropdown = block.getFieldValue("MONSTER");

		const position = generator.valueToCode(block, "POS", Order.ATOMIC);
		const code = /* javascript */ `
				function summonMonster() {
				const position = ${position};
				const messageToSend = commandMsg("/summon ${dropdown} " + position.x + " " + position.y + " " + position.z);
				wss.send(JSON.stringify(messageToSend));
				}
				summonMonster();
				`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_SUMMONMONSTER: "モンスター %1 を座標 %2 にスポーンさせる",
		BLAZE: "ブレイズ",
		BOGGED: "ボッグド",
		BREEZE: "ブリーズ",
		CREEPER: "クリーパー",
		ELDER_GUARDIAN: "エルダーガーディアン",
		ENDERMITE: "エンダーマイト",
		ENDER_DRAGON: "エンダードラゴン",
		EVOKER: "エヴォーカー",
		GHAST: "ガスト",
		GUARDIAN: "ガーディアン",
		HOGLIN: "ホグリン",
		HUSK: "ハスク",
		MAGMA_CUBE: "マグマキューブ",
		PHANTOM: "ファントム",
		PIGLIN_BRUTE: "ピグリンブルート",
		PILLAGER: "ピリジャー",
		RAVAGER: "ラヴェジャー",
		SHULKER: "シュルカー",
		SILVERFISH: "シルバーフィッシュ",
		SKELETON: "スケルトン",
		SLIME: "スライム",
		STRAY: "ストレイ",
		VEX: "ヴェックス",
		VINDICATOR: "ヴィンディケーター",
		WARDEN: "ウォーデン",
		WITCH: "ウィッチ",
		WITHER: "ウィザー",
		WITHER_SKELETON: "ウィザースケルトン",
		ZOGLIN: "ゾグリン",
		ZOMBIE: "ゾンビ",
		ZOMBIE_VILLAGER: "ゾンビビレジャー",
	},
	en: {
		MINECRAFT_SUMMONMONSTER: "Spawn monster %1 at %2",
		BLAZE: "Blaze",
		BOGGED: "Bogged",
		BREEZE: "Breeze",
		CREEPER: "Creeper",
		ELDER_GUARDIAN: "Elder Guardian",
		ENDERMITE: "Endermite",
		ENDER_DRAGON: "Ender Dragon",
		EVOKER: "Evoker",
		GHAST: "Ghast",
		GUARDIAN: "Guardian",
		HOGLIN: "Hoglin",
		HUSK: "Husk",
		MAGMA_CUBE: "Magma Cube",
		PHANTOM: "Phantom",
		PIGLIN_BRUTE: "Piglin Brute",
		PILLAGER: "Pillager",
		RAVAGER: "Ravager",
		SHULKER: "Shulker",
		SILVERFISH: "Silverfish",
		SKELETON: "Skeleton",
		SLIME: "Slime",
		STRAY: "Stray",
		VEX: "Vex",
		VINDICATOR: "Vindicator",
		WARDEN: "Warden",
		WITCH: "Witch",
		WITHER: "Wither",
		WITHER_SKELETON: "Wither Skeleton",
		ZOGLIN: "Zoglin",
		ZOMBIE: "Zombie",
		ZOMBIE_VILLAGER: "Zombie Villager",
	},
} satisfies globalThis.locale;
