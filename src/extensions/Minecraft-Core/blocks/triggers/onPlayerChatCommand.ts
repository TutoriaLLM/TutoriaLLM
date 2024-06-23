import { javascriptGenerator } from "blockly/javascript";

export const block = {
  type: "ext_minecraft_onplayerchatcommand",
  message0: "On Player Chat command %1 %2 %3",
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
  colour: 230,
  tooltip: "",
  helpUrl: "",
};

export function code() {
  javascriptGenerator.forBlock.ext_minecraft_onplayerchatcommand = (block, generator) => {
    // Collect argument strings.
    const fieldInput = block.getFieldValue("FIELD");
    const runInput = generator.statementToCode(block, "INPUT");

    const code = /*javascript*/ `
    console.info("Connect your  Minecraft at: vm/"+ code);

    vmExpress.get("/"+ code, async (req, res) => {
      res.send("Use Minecraft to connect to this server at: vm/"+ code);
    });

    vmExpress.ws("/"+ code, async (ws, req) => {

      console.info("Connection established. Sending subscribe message for Minecraft events: PlayerMessage.");
      ws.send(JSON.stringify(subscribeMsg("PlayerMessage")));
      ws.send(JSON.stringify(commandMsg("/say Hello, Minecraft!")));

      ws.on("message", async (message) => {
        console.info("received: %s", message);
        const data = JSON.parse(message);

        if (data && data.body && data.header.eventName === "PlayerMessage") {
          const messageText = data.body.message;
          if (messageText.startsWith("${fieldInput}")) {
            ${runInput}
          }
        }
      });

      ws.on("close", (ws) => {
        console.info("Connection closed.");
        ws.close();
      });
    });
    `;

    // Return code.
    return code;
  };
}
