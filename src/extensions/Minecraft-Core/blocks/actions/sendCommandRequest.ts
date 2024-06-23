import { javascriptGenerator, Order } from "blockly/javascript";

export const block = {
  type: "ext_minecraft_sendcommandrequest",
  message0: "%1 %{BKY_MINECRAFT_SENDCOMMANDREQUEST} %2",
  args0: [
    {
      type: "field_image",
      src: "src/extensions/Minecraft-Core/media/minecraft.png",
      width: 40,
      height: 40,
    },
    {
      type: "field_input",
      name: "NAME",
      text: "/say hello",
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: "#a855f7",
  tooltip: "",
  helpUrl: "",
};

export function code() {
  javascriptGenerator.forBlock["ext_minecraft_sendcommandrequest"] = function (
    block,
    generator
  ) {
    var text_command = block.getFieldValue("COMMAND");
    // todo: Assemble javascript into code variable.
    var code = /* javascript */ `
    commandMsg("${text_command}");
    
    `;

    return code;
  };
}

export const locale = {
  ja: {
    MINECRAFT_SENDCOMMANDREQUEST: "コマンドを実行する",
  },
  en: {
    MINECRAFT_SENDCOMMANDREQUEST: "Execute command",
  },
};
