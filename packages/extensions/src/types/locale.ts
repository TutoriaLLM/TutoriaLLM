/**
 * 拡張機能のブロックやカテゴリ名で使用するロケールを提供します Provides locale to use for block and category names in extensions
 * @example
 * ```ts
 * export const locale = {
	en: {
		MINECRAFT_VAR_XYZPOSITION: "Position %1 %2 %3",
	},
	ja: {
		MINECRAFT_VAR_XYZPOSITION: "座標 %1 %2 %3",
	},
} satisfies Locale;
 * ```
 */
export type Locale = {
	en: Record<string, string>;
	[key: string]: Record<string, string>;
};
