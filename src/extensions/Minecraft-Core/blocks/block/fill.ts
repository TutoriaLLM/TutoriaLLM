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
	previousStatement: null,
	nextStatement: null,
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_fillBlock = (block, generator) => {
		const blockName = generator.valueToCode(block, "BLOCK", Order.ATOMIC);
		const fromPos = JSON.parse(
			generator.valueToCode(block, "fromPos", Order.ATOMIC),
		);
		const toPos = JSON.parse(
			generator.valueToCode(block, "toPos", Order.ATOMIC),
		);
		let fromPosX = fromPos.x;
		let fromPosY = fromPos.y;
		let fromPosZ = fromPos.z;
		let toPosX = toPos.x;
		let toPosY = toPos.y;
		let toPosZ = toPos.z;

		// Remove parentheses if present
		fromPosX =
			fromPosX.startsWith("(") && fromPosX.endsWith(")")
				? fromPosX.slice(1, -1)
				: fromPosX;
		fromPosY =
			fromPosY.startsWith("(") && fromPosY.endsWith(")")
				? fromPosY.slice(1, -1)
				: fromPosY;
		fromPosZ =
			fromPosZ.startsWith("(") && fromPosZ.endsWith(")")
				? fromPosZ.slice(1, -1)
				: fromPosZ;
		toPosX =
			toPosX.startsWith("(") && toPosX.endsWith(")")
				? toPosX.slice(1, -1)
				: toPosX;
		toPosY =
			toPosY.startsWith("(") && toPosY.endsWith(")")
				? toPosY.slice(1, -1)
				: toPosY;
		toPosZ =
			toPosZ.startsWith("(") && toPosZ.endsWith(")")
				? toPosZ.slice(1, -1)
				: toPosZ;

		const code = /* javascript */ `
		function fillBlock() {
			const positionFrom = { x: ${fromPosX}, y: ${fromPosY}, z: ${fromPosZ} };
            const positionTo = { x: ${toPosX}, y: ${toPosY}, z: ${toPosZ} };
            const messageToSend = commandMsg("/fill" + " " + positionFrom.x + " " + positionFrom.y + " " + positionFrom.z + " " + positionTo.x + " " + positionTo.y + " " + positionTo.z + " " + "${blockName}");
			wss.send(JSON.stringify(messageToSend));
		}
		fillBlock();
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_FILLBLOCK: "%1 ブロックを座標 %2 から %3 まで並べる",
	},
	en: {
		MINECRAFT_SETBLOCK: "Place %1 block from position %2 to %3",
	},
};
