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
 * } satisfies Block;
 */
export type Block = {
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
