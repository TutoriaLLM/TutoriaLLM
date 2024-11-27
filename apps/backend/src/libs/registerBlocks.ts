import * as Blockly from "blockly";
import FastGlob from "fast-glob";
import path from "node:path";

export interface extLocale {
	en: Record<string, string>;
	[key: string]: Record<string, string>; // 他の言語も任意で追加可能
}

/**
 * 拡張ブロックの定義を提供します。
 * @param type ブロックの名称。ユニークで機能に関連する名前を使用してください。
 * @param message0 ブロックの表示名
 * @param args0 ブロックの引数
 * @param previousStatement 前のブロックとの接続を許可するかどうか
 * @param nextStatement 次のブロックとの接続を許可するかどうか
 * @param colour ブロックの色
 * @param tooltip ブロックのツールチップ
 * @param helpUrl ブロックのヘルプURL
 */

export interface extBlock {
	type: string;
	message0: string;
	args0?: Array<{
		type: string;
		name?: string;
		text?: string;
		check?: string;
	}>;
	output?: string;
	inputsInline?: boolean;
	previousStatement: any;
	nextStatement: any;
	colour: string;
	tooltip: string;
	helpUrl: string;
	customInit?: () => void;
}

// ブロックファイルの一覧を取得する
export async function getBlockFiles() {
	const rootDir = process.cwd();
	const blockFiles = await FastGlob(
		path.join(rootDir, "src/extensions/*/blocks/**/*.*"),
	);
	return blockFiles;
}

// 各ブロックファイルを読み込み、利用可能なブロックの情報を返す
export async function getAvailableBlocks(
	blockFiles: string[],
	language: string,
) {
	const availableBlocks = [] as Array<AvailableBlock>;

	await Promise.all(
		blockFiles.map(async (file) => {
			try {
				const filePath = path.resolve(file);
				const mod = await import(filePath);

				if (mod.block && mod.code) {
					const { block, code, locale } = mod;
					availableBlocks.push({ block, code, locale });
				} else {
					console.warn(`Module ${filePath} does not export 'block' or 'code'`);
				}
			} catch (error) {
				console.error(`Error loading block file ${file}:`, error);
			}
		}),
	);

	return availableBlocks;
}

// 利用可能なブロックをBlocklyに登録する
type AvailableBlock = {
	block: extBlock;
	code: () => void;
	locale: extLocale;
};

export function registerAvailableBlocks(
	availableBlocks: AvailableBlock[],
	language: string,
) {
	for (const { block, code, locale } of availableBlocks) {
		console.log("registerBlocks", block);

		Blockly.Blocks[block.type] = {
			init: function () {
				this.jsonInit(block);
			},
		};

		code();

		if (locale?.[language]) {
			// localeが記述されている場合は登録する(json形式)
			//console.log("register locale", locale);
			console.log("register language", language);
			for (const key in locale[language]) {
				if (Object.prototype.hasOwnProperty.call(locale[language], key)) {
					Blockly.Msg[key] = locale[language][key];
				}
			}
		}
	}
}

// ブロックファイルの取得、利用可能ブロックの取得、ブロックの登録を順番に行う
export async function registerBlocks(language: string) {
	const blockFiles = await getBlockFiles();
	const availableBlocks = await getAvailableBlocks(blockFiles, language);
	registerAvailableBlocks(availableBlocks, language);
}
