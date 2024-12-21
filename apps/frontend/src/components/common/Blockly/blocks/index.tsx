import * as Blockly from "blockly";
import extensionModules from "extensions";

const loadedExtensions = Object.values(extensionModules).flatMap(
	(mod) => mod.Blocks,
); // 各モジュールの Blocks プロパティをフラット化して1つの配列に結合

const loadedBlocks = loadedExtensions.flatMap((module) =>
	Object.values(module).flat(),
);

function registerBlocks(language: string) {
	for (const module of loadedBlocks) {
		if (module && typeof module === "object") {
			const { block, code, locale } = module;

			if (block) {
				Blockly.Blocks[block.type] = {
					init: function () {
						this.jsonInit(block);

						// `customInit` メソッドが定義されている場合にそれを呼び出す
						if (typeof block.customInit === "function") {
							block.customInit.call(this);
						}
					},
				};

				if (code) {
					// codeを登録する関数がある場合は実行する
					code();
				}

				if (locale?.[language]) {
					// localeが記述されている場合は登録する(json形式)
					for (const key in locale[language]) {
						if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
							Blockly.Msg[key] = locale[language][key];
						}
					}
				} else {
					// localeが記述されていない場合は英語を登録する
					for (const key in locale?.en) {
						if (Object.prototype.hasOwnProperty.call(locale.en, key)) {
							Blockly.Msg[key] = locale.en[key];
						}
						//英語も登録されていない場合はエラーを出力
						if (!locale?.en) {
							console.error("No English locale found for", module);
						}
					}
				}
			}
		} else {
			console.warn("Module is not an object or is undefined", module);
		}
	}
}

export function getExternalBlocks() {
	//フロントエンドで利用可能な拡張ブロックのリストを取得
	//block, code, localeを持つモジュールから、blockだけを取り出したリストを作成
	const blockList: string[] = [];
	const availableBlocks = loadedBlocks.map((module: any) => module);
	for (const block of availableBlocks) {
		blockList.push(block.block.type);
	}
	return blockList;
}

export default registerBlocks;
