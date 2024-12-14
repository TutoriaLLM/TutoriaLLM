import { AppErrorStatusCode, type AppErrorType } from "@/libs/errors/config";
import type { errorResponseSchema } from "@/libs/errors/schemas";
import type { Context } from "hono";

/**
 * エラーレスポンスを返す関数
 *
 * ステータスコードはAppErroTypeから関数内で導かれる
 */
export const errorResponse = <ErrorType extends AppErrorType>(
	c: Context,
	{
		message,
		type,
		err,
	}: {
		message: string;
		type: ErrorType;
		err?: Error;
	},
) => {
	if (err != null) console.error(err);

	const statusCode = AppErrorStatusCode[type];

	const error = {
		message,
		type,
		status: statusCode,
	};

	return c.json(
		{ error } as const satisfies typeof errorResponseSchema._type,
		statusCode,
	);
};
