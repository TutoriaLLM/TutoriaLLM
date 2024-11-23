import { z } from "@hono/zod-openapi";
import type { createRoute } from "@hono/zod-openapi";
import { AppErrorStatusCode } from "./errors/config.js";
import {
	createErrorResponseSchema,
	type createValidationErrorResponseSchema,
} from "./errors/schemas.js";

/**
 * application/json形式のスキーマは頻出なため、毎回書かなくてもいいようにする関数
 */
export const jsonBody = <
	T extends
		| NonNullable<
				NonNullable<
					Parameters<typeof createRoute>[0]["responses"][number]["content"]
				>["application/json"]
		  >["schema"]
		| NonNullable<
				NonNullable<
					NonNullable<
						NonNullable<Parameters<typeof createRoute>[0]["request"]>["body"]
					>["content"]
				>["application/json"]
		  >["schema"],
>(
	schema: T,
) => {
	return {
		"application/json": {
			schema: schema,
		},
	};
};

/**
 * エラーレスポンスのOpen API用の定義
 */
export const errorResponses = ({
	validationErrorResnponseSchemas,
}: {
	validationErrorResnponseSchemas?: [
		ReturnType<typeof createValidationErrorResponseSchema>,
		...ReturnType<typeof createValidationErrorResponseSchema>[],
	];
}) =>
	({
		[AppErrorStatusCode.BAD_REQUEST]: {
			description: "Bad request: problem processing request.",
			content: jsonBody(
				(() => {
					const baseSchema = createErrorResponseSchema("BAD_REQUEST").openapi(
						"BadRequestErrorResponse",
					);

					const schemas = validationErrorResnponseSchemas;

					// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
					return schemas ? z.union([baseSchema, ...schemas]) : baseSchema;
				})(),
			),
		},
		[AppErrorStatusCode.UNAUTHORIZED]: {
			description: "Unauthorized: authentication required.",
			content: jsonBody(
				createErrorResponseSchema("UNAUTHORIZED").openapi(
					"UnauthorizedErrorResponse",
				),
			),
		},
		[AppErrorStatusCode.FORBIDDEN]: {
			description: "Forbidden: insufficient permissions.",
			content: jsonBody(
				createErrorResponseSchema("FORBIDDEN").openapi(
					"ForbiddenErrorResponse",
				),
			),
		},
		[AppErrorStatusCode.NOT_FOUND]: {
			description: "Not found: resource does not exist.",
			content: jsonBody(
				createErrorResponseSchema("NOT_FOUND").openapi("NotFoundErrorResponse"),
			),
		},
		[AppErrorStatusCode.TOO_MANY_REQUESTS]: {
			description: "Too many requests: rate limit exceeded.",
			content: jsonBody(
				createErrorResponseSchema("TOO_MANY_REQUESTS").openapi(
					"TooManyRequestsErrorResponse",
				),
			),
		},
		[AppErrorStatusCode.SERVER_ERROR]: {
			description: "Server error: something went wrong.",
			content: jsonBody(
				createErrorResponseSchema("SERVER_ERROR").openapi(
					"ServerErrorResponse",
				),
			),
		},
	}) satisfies Parameters<typeof createRoute>[0]["responses"];
