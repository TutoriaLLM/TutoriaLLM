// 基本カテゴリのインポート
import logic from "./basics/blocks/logic";
import math from "./basics/blocks/math";
import loops from "./basics/blocks/loop";
import variables from "./basics/blocks/variables";

// 非ブロックカテゴリのインポート
import separator from "./basics/separator";

// src/extensions/*/toolbox/以下からすべてのツールボックスを動的にインポート
const extensionModules = import.meta.glob(
  "/src/extensions/*/toolbox/**/index.*",
  {
    eager: true,
  }
);

// 拡張機能モジュールを読み込む関数
const loadExtensions = () => {
  const extensions = Object.values(extensionModules);
  console.log("extensions for toolbox loaded");
  return extensions.map((mod: any) => mod.default);
};

// すべてのカテゴリを結合
const loadedExtensions = loadExtensions();
export const categoryContents = [
  //基本カテゴリ
  logic,
  math,
  loops,
  variables,
  //以下は拡張カテゴリ
  separator,
  ...loadedExtensions,
];

export default categoryContents;
