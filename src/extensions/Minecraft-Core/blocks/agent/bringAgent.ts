import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_TeleportAgentToPlayer",
	message0: "%{BKY_MINECRAFT_TELEPORTAGENTTOPLAYER}",
	args0: [],
	previousStatement: null,
	nextStatement: null,
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_TeleportAgentToPlayer = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		const playerPos = {
			x: minecraftWorldState.player.position.x,
			y: minecraftWorldState.player.position.y,
			z: minecraftWorldState.player.position.z,
		};
		const message = commandMsg("/agent tp" + " " + playerPos.x + " " + ((playerPos.y)-2) + " " + playerPos.z);
		wss.send(JSON.stringify(message));
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_TELEPORTAGENTTOPLAYER:
			"エージェントをプレイヤーにテレポートさせる",
	},
	en: {
		MINECRAFT_TELEPORTAGENTTOPLAYER: "Teleport Agent to Player",
	},
};
