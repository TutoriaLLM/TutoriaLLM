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
    const commandValue = block.getFieldValue("FIELD");
    const innerCode = generator.valueToCode(block, "INPUT", Order.ATOMIC);

    // Return code.
    return [
      `console.log("on player chat command ${commandValue} do:${innerCode}")`,
      Order.NONE,
    ];
  };
}
