import { Order, javascriptGenerator } from "blockly/javascript";
import "@blockly/field-slider";

export const block = {
	type: "ext_minecraft_fillBlock",
	message0: "%{BKY_MINECRAFT_FILLBLOCK}",
	args0: [
		{
			type: "input_value",
			name: "BLOCK",
			check: "Block",
		},
		{
			type: "input_end_row",
		},
		{
			type: "input_value",
			name: "fromPos", //positionは {x: number, y: number, z: number} という形式のオブジェクト（パースする必要あり）
			check: "Position",
		},
		{
			type: "input_value",
			name: "toPos", //positionは {x: number, y: number, z: number} という形式のオブジェクト（パースする必要あり）
			check: "Position",
		},
	],
	inputsInline: true, // インライン入力を有効にする
	previousStatement: null,
	nextStatement: null,
	colour: "#22c55e",
	tooltip: "",
	helpUrl: "",
} satisfies globalThis.block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_fillBlock = (block, generator) => {
		const fromPos = generator.valueToCode(block, "fromPos", Order.ATOMIC);
		const toPos = generator.valueToCode(block, "toPos", Order.ATOMIC);

		const code = /* javascript */ `
		function fillBlock() {
        //値は可変なため、実行時に取得する
        const fromPos = ${fromPos};
        const toPos = ${toPos};
        let fromX = fromPos.x;
		let fromY = fromPos.y;
		let fromZ = fromPos.z;
		let toX = toPos.x;
		let toY = toPos.y;
		let toZ = toPos.z;

            const positionFrom = { x: fromX, y: fromY, z: fromZ };
            const positionTo = { x: toX, y: toY, z: toZ };
            const messageToSend = commandMsg("/fill" + " " + positionFrom.x + " " + (positionFrom.y -1) + " " + positionFrom.z + " " + positionTo.x + " " + (positionTo.y -1) + " " + positionTo.z + " " + "${generator.valueToCode(block, "BLOCK", Order.ATOMIC)}");
			wss.send(JSON.stringify(messageToSend));
		}
		fillBlock();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_FILLBLOCK: "%1 ブロックを座標 %2 %3 から %4 まで並べる",
	},
	en: {
		MINECRAFT_FILLBLOCK: "Place %1 block from position %2 %3 to %4",
	},
} satisfies globalThis.locale;
