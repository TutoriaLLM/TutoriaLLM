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

    const code = `console.log("execute${field_input}run${run_input}")`;

    // Return code.
    return code;
  };
}
