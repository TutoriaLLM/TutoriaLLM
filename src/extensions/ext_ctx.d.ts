declare module "extensionContext" {
	import type { Hono } from "hono";
	import type { UpgradeWebSocket } from "hono/ws";
	import type { SessionValue } from "../type.ts";
	import type { i18n } from "i18next";

	//エディター内で宣言を直接使用できるようにする
	declare global {
		const context: extScriptContext;
		const app: Hono;
		const joinCode: string;
		const session: SessionValue;
		const serverRootPath: string;
		const upgradeWebSocket: UpgradeWebSocket;
		const console: {
			log: (...args: string[]) => void;
			error: (...args: string[]) => void;
			info: (...args: string[]) => void;
		};
		const { t }: i18n;
	}

	/**
	 * ツールボックスのカテゴリ作成時に使用できる型を提供します
	 * @param name カテゴリ名
	 * @param colour カテゴリの色
	 * @param contents カテゴリ内のブロック
	 */
	export interface extCategory {
		kind: "category";
		name: string;
		colour: string;
		contents: Array<{
			kind: "block";
			type: string;
			field?: any;
			inputs?: any;
		}>;
	}

	/**
	 * 拡張機能のブロックやカテゴリ名で使用するロケールを提供します
	 */
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
		inputsInline?: boolean;
		previousStatement: any;
		nextStatement: any;
		colour: string;
		tooltip: string;
		helpUrl: string;
		customInit?: () => void;
	}
}
