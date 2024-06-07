import { javascriptGenerator, Order } from "blockly/javascript";

export const block = {
  type: "ext_minecraft_onplayertransform",
  message0: "On Player %1 %2 %3",
  args0: [
    {
      type: "field_dropdown",
      name: "DROPDOWN",
      options: [
        ["walk", "onPlayerWalking"],
        ["swim", "onPlayerSwim"],
      ],
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
  javascriptGenerator.forBlock["ext_minecraft_onplayertransform"] = function (
    block,
    generator
  ) {
    // Collect argument strings.
    const fieldValue = block.getFieldValue("DROPDOWN");
    const innerCode = generator.valueToCode(block, "INPUT", Order.ATOMIC);

    // Return code.
    return [`console.log("${innerCode + fieldValue}")`, Order.NONE];
  };
}
