import * as Blockly from "blockly";

import extensionModules from "extensions";
import basicModules from "./basics/blocks";
import separator from "./basics/separator.js";

const loadedToolbox = Object.values(extensionModules).flatMap(
	(mod) => mod.Toolbox,
);

// 基本カテゴリをインポート
const loadedBasicModules = Object.values(basicModules).map((mod) => mod);

// モジュールを結合。
const combinedModules = [...loadedBasicModules, separator, ...loadedToolbox];
console.log("combinedModules for toolbox", combinedModules);
const loadExtensions = () => {
	const extensions = Object.values(combinedModules);
	return extensions.map((mod) => mod);
};

const loadedExtensions = loadExtensions();
console.log("loadedExtensions for toolbox", loadedExtensions);

// カテゴリとセパレータのみを取り出す
const categoryContents = loadedExtensions
	.filter(
		(ext) => ext && (("category" in ext && ext.category) || ext === separator),
	) // ext と ext.category の存在を確認
	.map((ext) => (ext === separator ? ext : "category" in ext && ext.category)) // ext がセパレータの場合はそのまま、そうでない場合は category を取り出す
	.filter((ext) => ext !== false); // カテゴリの翻訳を行う関数

//same as extensions package
type Locale = {
	[key: string]: Record<string, string>;
	en: Record<string, string>;
};

export function translateCategories(language: string) {
	for (const ext of loadedExtensions.filter((ext) => ext && "locale" in ext)) {
		const locale = ext.locale as Locale;
		if (locale[language]) {
			// localeが記述されている場合は登録する(json形式)
			for (const key in locale[language]) {
				if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
					Blockly.Msg[key] = locale[language][key];
				}
			}
		} else {
			// localeが記述されていない場合は英語を登録する
			if (locale.en) {
				for (const key in ext.locale?.en) {
					if (Object.prototype.hasOwnProperty.call(ext.locale.en, key)) {
						Blockly.Msg[key] = locale.en[key];
					}
				}
			}
			//英語も登録されていない場合はエラーを出力
			else {
				console.error(`locale not found in ${ext}`);
			}
		}
	}
}

export const toolboxCategories = {
	kind: "categoryToolbox",
	contents: categoryContents,
} satisfies Blockly.utils.toolbox.ToolboxItemInfo;

export default toolboxCategories;
