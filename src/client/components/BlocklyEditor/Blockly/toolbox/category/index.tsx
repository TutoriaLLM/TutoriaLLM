import * as Blockly from "blockly";

// src/extensions/*/toolbox/以下からすべてのツールボックスを動的にインポート
const extensionModules = import.meta.glob(
	"/src/extensions/*/toolbox/**/index.*",
	{
		eager: true,
	},
);

// 基本カテゴリをインポート
const basicModules = import.meta.glob(
	"/src/client/components/BlocklyEditor/Blockly/toolbox/category/basics/blocks/*.*",
	{
		eager: true,
	},
);

import separator from "./basics/separator.js";

// モジュールを結合。
const combinedModules = {
	...basicModules,
	separator,
	...extensionModules,
};

const loadExtensions = () => {
	const extensions = Object.values(combinedModules);
	return extensions.map((mod: any) => mod);
};

const loadedExtensions = loadExtensions();
console.log("loadedExtensions for toolbox", loadedExtensions);

// カテゴリとセパレータのみを取り出す
const categoryContents = loadedExtensions
	.filter((ext) => ext && (ext.category || ext === separator)) // ext と ext.category の存在を確認
	.map((ext) => ext.category || ext);

// カテゴリの翻訳を行う関数
export function translateCategories(language: string) {
	for (const ext of loadedExtensions) {
		if (ext.locale?.[language]) {
			// localeが記述されている場合は登録する(json形式)
			for (const key in ext.locale[language]) {
				if (Object.prototype.hasOwnProperty.call(ext.locale[language], key)) {
					Blockly.Msg[key] = ext.locale[language][key];
				}
			}
		} else {
			// localeが記述されていない場合は英語を登録する
			for (const key in ext.locale?.en) {
				if (Object.prototype.hasOwnProperty.call(ext.locale.en, key)) {
					Blockly.Msg[key] = ext.locale.en[key];
				}
			}
			//英語も登録されていない場合はエラーを出力
			if (!ext.locale?.en) {
				console.error("No English locale found for", ext);
			}
		}
	}
}

export const toolboxCategories = {
	kind: "categoryToolbox",
	contents: categoryContents,
};

export default toolboxCategories;
