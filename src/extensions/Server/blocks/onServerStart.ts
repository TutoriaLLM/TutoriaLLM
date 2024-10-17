import { Order, javascriptGenerator } from "blockly/javascript";
import type { extBlock, extLocale } from "extensionContext";

export const block = {
	type: "ext_server_onServerStart",
	message0: "%{BKY_SERVER_ONSERVERSTART}",
	args0: [
		{
			type: "input_dummy",
		},
		{
			type: "input_statement",
			name: "INPUT",
		},
	],
	inputsInline: true,
	colour: "#57534e",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_server_onServerStart = (
		block,
		generator,
	) => {
		// Collect argument strings.
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `
        //Subscribe to the message event
        function onServerStart() {
            ${run_input}
        }
        onServerStart();
        `;

		// Return code.
		return code;
	};
}

export const locale: extLocale = {
	ja: {
		SERVER_ONSERVERSTART: "サーバー起動時 %1 %2",
	},
	en: {
		SERVER_ONSERVERSTART: "on server start %1 %2",
	},
};
