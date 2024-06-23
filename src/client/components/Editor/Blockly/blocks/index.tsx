import * as Blockly from "blockly";

// src/extensions/*/blocks/以下からすべてのツールボックスを動的にインポート
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const extensionModules: any = import.meta.glob("/src/extensions/*/blocks/**/*.*", {
  eager: true,
});
// 拡張機能モジュールを読み込む関数
const loadExtensions = () => {
  const extensions = Object.values(extensionModules);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return extensions.map((mod: any) => mod);
};
const loadedExtensions = loadExtensions();
console.info("loadedExtensions for block", loadedExtensions);

function registerBlocks() {
  console.info("registerBlocks");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  // biome-ignore lint/complexity/noForEach: <explanation>
  loadedExtensions.forEach((module: any) => {
    if (module && typeof module === "object") {
      const { block, code } = module;
      console.info("registerBlocks", block);

      if (block) {
        Blockly.Blocks[block.type] = {
          init: function () {
            this.jsonInit(block);
          },
        };
        if (code) {
          //codeを登録する関数がある場合は実行する
          code();
        }
      }
    } else {
      console.warn("Module is not an object or is undefined", module);
    }
  });
}

export default registerBlocks;
