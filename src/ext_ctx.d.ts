import type { UpgradeWebSocket } from "hono/ws";

// context.d.ts
declare module "extentionContext" {
	import type http from "node:http";
	import type { WebSocket } from "ws";
	import type * as Blockly from "blockly";
	import type { Hono } from "hono";

	/**
	 * スクリプト実行時に使用できる型定義を提供します
	 * @param code スクリプトのコード
	 * @param uuid スクリプトのUUID
	 * @param console コンソール
	 * @param http HTTPモジュール
	 * @param serverRootPath サーバーのルートパス
	 * @param WebSocket WebSocketモジュール
	 */
	export interface extScriptContext {
		code: string;
		session: string;
		console: {
			log: (...args: string[]) => void;
			error: (...args: string[]) => void;
		};
		app: Hono;
		upgradeWebSocket: UpgradeWebSocket;
		serverRootPath: string;
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
		args0: Array<{
			type: string;
			name: string;
			text?: string;
		}>;
		previousStatement: any;
		nextStatement: any;
		colour: number;
		tooltip: string;
		helpUrl: string;
	}
}
