import { AppErrorStatusCode, AppErrorType } from "@/libs/errors/config";
import { getKeys } from "@/libs/errors/object";
import { zodLiteralUnionType } from "@/libs/errors/zod";
import { z } from "@hono/zod-openapi";
import type { AnyZodObject } from "zod";

/* *
 * Schema of error responses
 */
export const errorResponseSchema = z.object({
	error: z.object({
		message: z.string(),
		type: z.enum(AppErrorType),
		/* *
		 * Only allow Http error status codes that are explicitly used in the app.
		 */
		status: zodLiteralUnionType(Object.values(AppErrorStatusCode)),
	}),
});

/* *
 * Generate schema for error responses
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

/* *
 * Generate a schema for a validation error response for a given schema.
 */
export const createValidationErrorResponseSchema = <T extends AnyZodObject>(
	schema: T,
) => {
	// Retrieve only the topmost key from the schema to return a flattened error
	// Without FLATTEN, the response structure will be complicated.
	const keys = getKeys(schema.shape);

	// Generate a schema of key values for the keys retrieved above and their error messages
	const fieldErrorSchemas = Object.fromEntries(
		keys.map((k) => [k, z.string().optional()]),
	);

	// String to identify the type of error in the application
	const errorType = "VALIDATION_ERROR" satisfies AppErrorType;

	// Merge schema to have information about normal errors as well
	return errorResponseSchema.merge(
		z.object({
			error: errorResponseSchema.shape.error.merge(
				z.object({
					// Uniquely fix type and status on validation error
					type: z.literal(errorType),
					status: z.literal(AppErrorStatusCode[errorType]),
					// Error messages about the entire form
					formErrors: z.string(),
					// Error messages for each flattened field
					fieldErrors: z.object(fieldErrorSchemas),
				}),
			),
		}),
	);
};
