import { Order, javascriptGenerator } from "blockly/javascript";

import image from "../../media/minecraft.png";

export const block = {
	type: "ext_minecraft_onplayerchatcommand",
	message0: "%{BKY_MINECRAFT_ONPLAYERCHATCOMMAND}",
	args0: [
		{
			type: "field_input",
			name: "FIELD",
			text: "hello",
		},
		{
			type: "input_dummy",
		},
		{
			type: "input_statement",
			name: "INPUT",
		},
	],
	colour: "#a855f7",
	tooltip: "",
	helpUrl: "",
};

export function code() {
	javascriptGenerator.forBlock.ext_minecraft_onplayerchatcommand = (
		block,
		generator,
	) => {
		// Collect argument strings.
		const field_input = block.getFieldValue("FIELD");
		const run_input = generator.statementToCode(block, "INPUT");

		const code = /*javascript*/ `
    console.log("Connect your  Minecraft at: api/vm/"+ code);

    vmExpress.get("/"+ code, async (req, res) => {
      res.send("Use Minecraft to connect to this server at: vm/"+ code);
    });

    vmExpress.ws("/"+ code, async (ws, req) => {

      console.log("Connection established. Sending subscribe message for Minecraft events: PlayerMessage.");
      ws.send(JSON.stringify(subscribeMsg("PlayerMessage")));
      ws.send(JSON.stringify(commandMsg("/say Hello, Minecraft!")));

      ws.on("message", async (message) => {
      const data = JSON.parse(message);

      if (data && data.body && data.header.eventName === "PlayerMessage") {
        const messageText = data.body.message;
        if (messageText === "${field_input}") {
        ${run_input}
        }
      }
      });

      ws.on("close", () => {
      console.log("Connection closed.");
      });
    });
    `;

		// Return code.
		return code;
	};
}

export const locale = {
	en: {
		MINECRAFT_ONPLAYERCHATCOMMAND: "on player chat  %1 %2 %3",
	},
	ja: {
		MINECRAFT_ONPLAYERCHATCOMMAND: "プレイヤーが %1 とチャットしたとき %2 %3",
	},
};
