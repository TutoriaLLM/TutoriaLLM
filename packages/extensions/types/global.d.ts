import type { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";

declare global {
	const context: extScriptContext;
	const app: Hono;
	const joinCode: string;
	const session: any;
	const serverRootPath: string;
	const randomUUID: typeof import("crypto").randomUUID;
	const upgradeWebSocket: UpgradeWebSocket;
	const console: {
		log: (...args: string[]) => void;
		error: (...args: string[]) => void;
		info: (...args: string[]) => void;
	};
	const { t }: i18n;

	/**
	 * ツールボックスのカテゴリ作成時に使用できる型を提供します Provides types that can be used when creating a category in the toolbox
	 * @param name カテゴリ名 Category name
	 * @param colour カテゴリの色 Category color
	 * @param contents カテゴリ内のブロック Blocks in the category
	 */
	type category = {
		kind: "category";
		name: string;
		colour: string;
		contents: Array<{
			kind: "block";
			type: string;
			field?: any;
			inputs?: any;
		}>;
	};

	/**
	 * 拡張機能のブロックやカテゴリ名で使用するロケールを提供します Provides locale to use for block and category names in extensions
	 */
	type locale = {
		en: Record<string, string>;
		[key: string]: Record<string, string>;
	};

	type code = () => void;

	/**
	 * Provides types for the block definition
	 * @param type ブロックの名称。ユニークで機能に関連する名前を使用してください。 Name of the block. Please use a unique and function-related name.
	 * @param message0 ブロックの表示名 Display name of the block
	 * @param args0 ブロックの引数 Arguments of the block
	 * @param previousStatement 前のブロックとの接続を許可するかどうか Allow connection with the previous block
	 * @param nextStatement 次のブロックとの接続を許可するかどうか Allow connection with the next block
	 * @param colour ブロックの色 Block color
	 * @param tooltip ブロックのツールチップ Block tooltip
	 * @param helpUrl ブロックのヘルプURL Block help URL
	 * @param customInit ブロックの初期化時にTutoriaLLM VMで実行する関数 Function to run on block initialization in TutoriaLLM VM
	 * @example
	 * ```ts
	 * export const block: block = {
	 * ...
	 * }
	 * //or
	 * export const block = {
	 * ...
	 * } satisfies globalThis.block;
	 */
	type block = {
		type: string;
		message0: string;
		args0?: Array<{
			type: string;
			name?: string;
			text?: string;
			field?: any;
			min?: number;
			max?: number;
			value?: number;
			check?: string;
			options?: Array<[string, string]> | any[];
		}>;
		output?: string;
		inputsInline?: boolean;
		previousStatement?: any;
		nextStatement?: any;
		colour: string;
		tooltip?: string;
		helpUrl?: string;
		customInit?: () => void;
	};
}
