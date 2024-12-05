import { Order, javascriptGenerator } from "blockly/javascript";
export const block = {
	type: "ext_minecraft_teleport",
	message0: "%{BKY_MINECRAFT_TELEPORT}",
	args0: [
		{
			type: "field_dropdown",
			name: "TARGET",
			options: [
				["%{BKY_ALL_PLAYERS}", "@a"],
				["%{BKY_ENTITY}", "@e"],
				["%{BKY_CLOSEST_PLAYER}", "@p"],
				["%{BKY_RANDOM_PLAYER}", "@r"],
				["%{BKY_YOURSELF}", "@s"],
			],
		},
		{
			type: "input_value",
			name: "PosX",
			check: "Number",
		},
		{
			type: "input_value",
			name: "PosY",
			check: "Number",
		},
		{
			type: "input_value",
			name: "PosZ",
			check: "Number",
		},
	],
	previousStatement: null,
	nextStatement: null,
	colour: "#d97706",
	tooltip: "",
	helpUrl: "",
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_teleport = (block, generator) => {
		//dropdown
		const dropdown = block.getFieldValue("TARGET");
		//pos
		let x = generator.valueToCode(block, "PosX", Order.ATOMIC);
		let y = generator.valueToCode(block, "PosY", Order.ATOMIC);
		let z = generator.valueToCode(block, "PosZ", Order.ATOMIC);

		// Remove parentheses if present
		x = x.startsWith("(") && x.endsWith(")") ? x.slice(1, -1) : x;
		y = y.startsWith("(") && y.endsWith(")") ? y.slice(1, -1) : y;
		z = z.startsWith("(") && z.endsWith(")") ? z.slice(1, -1) : z;
		const code = /* javascript */ `
				function teleport() {
				const position = { x: ${x}, y: ${y}, z: ${z} };
				const messageToSend = commandMsg("/tp ${dropdown} " + position.x + " " + position.y + " " + position.z);
				wss.send(JSON.stringify(messageToSend));
				}
				teleport();
				`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_TELEPORT: "%1 を %2 %3 %4 にテレポートする ",
		ALL_PLAYERS: "全プレイヤー",
		ENTITY: "エンティティ",
		CLOSEST_PLAYER: "最も近いプレイヤー",
		RANDOM_PLAYER: "ランダムなプレイヤー",
		YOURSELF: "自分",
	},
	en: {
		MINECRAFT_TELEPORT: "Teleport %1 to %2 %3 %4",
		ALL_PLAYERS: "All players",
		ENTITY: "Entity",
		CLOSEST_PLAYER: "Closest player",
		RANDOM_PLAYER: "Random player",
		YOURSELF: "Yourself",
	},
} satisfies globalThis.locale;
