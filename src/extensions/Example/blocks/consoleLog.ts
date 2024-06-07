import { javascriptGenerator, Order } from "blockly/javascript";

export const block = {
  type: "ext_example_console_log",
  message0: "send console.log text %1",
  args0: [
    {
      type: "field_input",
      name: "TEXT",
      text: "hello world!",
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 230,
  tooltip: "",
  helpUrl: "",
};

export function code() {
  javascriptGenerator.forBlock["ext_example_console_log"] = function (
    block,
    generator
  ) {
    // Collect argument strings.
    var text_text = block.getFieldValue("TEXT");

    const code = `console.log("${text_text}");\n`;

    // Return code.
    return code;
  };
}
