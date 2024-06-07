import { javascriptGenerator, Order } from "blockly/javascript";

export const block = {
  type: "ext_minecraft_sendcommandrequest",
  message0: "send command %1",
  args0: [
    {
      type: "field_input",
      name: "NAME",
      text: "/say hello",
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 230,
  tooltip: "",
  helpUrl: "",
};

export function code() {
  javascriptGenerator.forBlock["ext_minecraft_sendcommandrequest"] = function (
    block,
    generator
  ) {
    var text_command = block.getFieldValue("COMMAND");
    // TODO: Assemble javascript into code variable.
    var code = `sendCommandRequest("${text_command}");`;

    return code;
  };
}
