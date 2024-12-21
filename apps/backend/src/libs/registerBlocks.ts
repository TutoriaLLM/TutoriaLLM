import * as Blockly from "blockly";
import extensionModules, { type Locale, type Block } from "extensions"; // デフォルトエクスポートとしてインポート
type AvailableBlock = {
	block: Block;
	code: () => void;
	locale: Locale;
};

const loadedExtensions = Object.values(extensionModules).flatMap(
	(mod) => mod.Blocks,
); // 各モジュールの Blocks プロパティをフラット化して1つの配列に結合

export function registerAvailableBlocks(
	availableBlocks: AvailableBlock[],
	language: string,
) {
	for (const { block, code, locale } of availableBlocks) {
		Blockly.Blocks[block.type] = {
			init: function () {
				this.jsonInit(block);
			},
		};

		code();

		if (locale?.[language]) {
			// localeが記述されている場合は登録する(json形式)
			for (const key in locale[language]) {
				if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
					Blockly.Msg[key] = locale[language][key];
				}
			}
		}
	}
}

// ブロックファイルの取得、利用可能ブロックの取得、ブロックの登録を順番に行う
export function registerBlocks(language: string) {
	//block, code, localeをモジュールから取り出す

	const availableBlocks: AvailableBlock[] = [];
	for (const module of loadedExtensions) {
		for (const mod of Object.values(module).flat()) {
			availableBlocks.push({
				block: mod.block,
				code: mod.code,
				locale: mod.locale,
			});
		}
	}
	registerAvailableBlocks(availableBlocks, language);
}

//ブロック名だけを取り出し、配列にする
export async function getBlockNames() {
	const availableBlocks: AvailableBlock[] = [];
	for (const module of loadedExtensions) {
		for (const mod of Object.values(module).flat()) {
			availableBlocks.push({
				block: mod.block,
				code: mod.code,
				locale: mod.locale,
			});
		}
	}
	const blockNames = availableBlocks.map((block) => block.block.type);
	return blockNames;
}
