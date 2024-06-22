import { javascriptGenerator, Order } from "blockly/javascript";

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
  javascriptGenerator.forBlock["ext_minecraft_onplayerchatcommand"] = function (
    block,
    generator
  ) {
    // Collect argument strings.
    var field_input = block.getFieldValue("FIELD");
    var run_input = generator.statementToCode(block, "INPUT");

    const code = /* javascript */ `

    wss.on("connection", (ws) => {
      console.log("Minecraft connected");
      ws.send(JSON.stringify(subscribeMsg("PlayerMessage")));
    });

    wss.on("message", function incoming(data) {
      let message;
      try {
        message = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing message:", error);
        return;
      }

      if (message && message.body && message.body.eventName === "PlayerMessage") {
        const playerName = message.body.properties.Sender;
        const messageText = message.body.properties.Message;
        if (messageText.startsWith("${field_input}")) {
          ${run_input}
        }
      }
    });
    `;

    // Return code.
    return code;
  };
}
