import { javascriptGenerator } from "blockly/javascript";

import type { Block } from "@/types/block";
import type { Locale } from "@/types/locale";

export const block = {
	type: "ext_minecraft_createAgent",
	message0: "%{BKY_MINECRAFT_CREATEAGENT}",
	args0: [],
	previousStatement: null,
	nextStatement: null,
	colour: "#f43f5e",
	tooltip: "",
	helpUrl: "",
} satisfies Block;

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_createAgent = (
		block,
		generator,
	) => {
		const code = /* javascript */ `
		wss.send(JSON.stringify(commandMsg("/agent create")));
		`;

		return code;
	};
}

export const locale = {
	ja: {
		MINECRAFT_CREATEAGENT: "エージェントを作成する",
	},
	en: {
		MINECRAFT_CREATEAGENT: "Create Agent",
	},
} satisfies Locale;
