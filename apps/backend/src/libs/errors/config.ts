import type {
	ClientErrorStatusCode,
	ServerErrorStatusCode,
} from "hono/utils/http-status";

export const AppErrorType = [
	"BAD_REQUEST",
	"VALIDATION_ERROR",
	"UNAUTHORIZED",
	"FORBIDDEN",
	"NOT_FOUND",
	"SERVER_ERROR",
	"TOO_MANY_REQUESTS",
] as const;

export type AppErrorType = (typeof AppErrorType)[number];

/* *
 * Manage error types and corresponding status codes handled within the application
 */
export const AppErrorStatusCode = {
	BAD_REQUEST: 400,
	VALIDATION_ERROR: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	TOO_MANY_REQUESTS: 429,
	SERVER_ERROR: 500,
	// Add other status codes as needed
} as const satisfies Record<
	AppErrorType,
	ClientErrorStatusCode | ServerErrorStatusCode
>;
