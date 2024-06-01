import * as Blockly from "blockly";

function registerBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "trigger_playermessage",
      message0: "TEST:When Player says: %1 %2 Do %3",
      args0: [
        {
          type: "field_input",
          name: "TEXT",
          text: "hello",
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "TEXT",
        },
      ],
      colour: 230,
      tooltip: "THIS IS TEST BLOCK",
      helpUrl: "",
    },
  ]);
}

export default registerBlocks;
