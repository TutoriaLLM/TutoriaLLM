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
		wss.send(JSON.stringify(commandMsg("/agent tp @p")));
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
