import type { Context } from "@/context";
import { AppErrorStatusCode, type AppErrorType } from "@/libs/errors/config";
import type { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import type { Hook } from "@hono/zod-openapi";

/**
 * バリデーションエラーが発生した時のデフォルト処理
 */
export const defaultHook: Hook<unknown, Context, "", unknown> = (result, c) => {
	if (result.success) return;

	// エラーをfflatenして取得
	const { formErrors, fieldErrors } = result.error.flatten();

	// アプリケーション内でエラーの種類を識別するための文字列
	const errorType = "VALIDATION_ERROR" satisfies AppErrorType;

	const status = AppErrorStatusCode[errorType];

	return c.json(
		{
			error: {
				message: "Validation error occurred",
				type: errorType,
				status,
				// フォーム全体に関するエラーメッセージ
				formErrors: formErrors[0],
				// flattenしたフィールド名とエラーメッセージのキーバリュー
				fieldErrors: Object.fromEntries(
					Object.entries(fieldErrors).map(([key, value]) => [
						key,
						(value ?? [])[0],
					]),
				),
			},
		} satisfies ReturnType<typeof createValidationErrorResponseSchema>["_type"],
		status,
	);
};
