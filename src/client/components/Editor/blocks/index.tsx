import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// src/extensions/*/blocks/以下からすべてのツールボックスを動的にインポート
const extensionModules: any = import.meta.glob(
  "/src/extensions/*/blocks/**/*.*",
  {
    eager: true,
  }
);
// 拡張機能モジュールを読み込む関数
const loadExtensions = () => {
  const extensions = Object.values(extensionModules);
  return extensions.map((mod: any) => mod);
};
const loadedExtensions = loadExtensions();
console.log("loadedExtensions for block", loadedExtensions);

function registerBlocks() {
  console.log("registerBlocks");
  loadedExtensions.forEach((module: any) => {
    if (module && typeof module === "object") {
      const { block, code } = module;
      console.log("registerBlocks", block);

      if (block) {
        Blockly.Blocks[block.type] = {
          init: function () {
            this.jsonInit(block);
          },
        };
        if (code) {
          code();
        }
      }
    } else {
      console.warn("Module is not an object or is undefined", module);
    }
  });
}

export default registerBlocks;
