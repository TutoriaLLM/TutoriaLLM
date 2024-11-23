import { Order, javascriptGenerator } from "blockly/javascript";

export const block = {
	type: "ext_minecraft_var_AgentPos", //XYZ座標を取得するブロック
	colour: "#6366f1",
	message0: "%{BKY_MINECRAFT_VAR_AGENTPOS}", //プレイヤーの座標
	output: "Position",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_var_AgentPos = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
        {
			x: minecraftWorldState.agent.getPosition().x,
			y: minecraftWorldState.agent.getPosition().y,
			z: minecraftWorldState.agent.getPosition().z,
		};
        `;
		return [code, Order.ATOMIC];
	};
}

export const locale = {
	en: {
		MINECRAFT_VAR_AGENTPOS: "Agent Position",
	},
	ja: {
		MINECRAFT_VAR_AGENTPOS: "エージェントの座標",
	},
};
