import { z } from "@hono/zod-openapi";
import type { AnyZodObject } from "zod";
import { AppErrorStatusCode, AppErrorType } from "@/libs/errors/config";
import { zodLiteralUnionType } from "@/libs/errors/zod";
import { getKeys } from "@/libs/errors/object";

/**
 * エラーレスポンスのスキーマ
 */
export const errorResponseSchema = z.object({
	error: z.object({
		message: z.string(),
		type: z.enum(AppErrorType),
		/**
		 * アプリ内で明示的に使用しているHttpエラーのステータスコードだけを許容する
		 */
		status: zodLiteralUnionType(Object.values(AppErrorStatusCode)),
	}),
});

/**
 * エラーレスポンスのスキーマを生成する
 */
export const createErrorResponseSchema = (
	type: typeof errorResponseSchema.shape.error._type.type,
) => {
	return errorResponseSchema.merge(
		z.object({
			error: errorResponseSchema.shape.error.merge(
				z.object({
					status: z.literal(AppErrorStatusCode[type]),
					type: z.literal(type),
				}),
			),
		}),
	);
};

/**
 * あるスキーマに対応するバリデーションエラーレスポンスのスキーマを生成する
 */
export const createValidationErrorResponseSchema = <T extends AnyZodObject>(
	schema: T,
) => {
	// flattenしたエラーを返すため、最上位のキーのみをスキーマから取得する
	// flattenしないとレスポンスの構造が複雑になってしまう
	const keys = getKeys(schema.shape);

	// 上で取得したキーとそれのエラーメッセージのキーバリューのスキーマを生成
	const fieldErrorSchemas = Object.fromEntries(
		keys.map((k) => [k, z.string().optional()]),
	);

	// アプリケーション内でエラーの種類を識別するための文字列
	const errorType = "VALIDATION_ERROR" satisfies AppErrorType;

	// 通常のエラーの情報も持つため、スキーマをマージする
	return errorResponseSchema.merge(
		z.object({
			error: errorResponseSchema.shape.error.merge(
				z.object({
					// バリデーションエラー時のtypeとstatusは一意に固定する
					type: z.literal(errorType),
					status: z.literal(AppErrorStatusCode[errorType]),
					// フォーム全体に関するエラーメッセージ
					formErrors: z.string(),
					// flattenしたフィールドごとのエラーメッセージ
					fieldErrors: z.object(fieldErrorSchemas),
				}),
			),
		}),
	);
};
