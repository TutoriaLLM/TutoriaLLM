import type { Context } from "@/context";
import { AppErrorStatusCode, type AppErrorType } from "@/libs/errors/config";
import type { createValidationErrorResponseSchema } from "@/libs/errors/schemas";
import type { Hook } from "@hono/zod-openapi";

/* *
 * Default processing when a validation error occurs
 */
export const defaultHook: Hook<unknown, Context, "", unknown> = (result, c) => {
	if (result.success) return;

	// flatten and retrieve errors
	const { formErrors, fieldErrors } = result.error.flatten();

	// String to identify the type of error in the application
	const errorType = "VALIDATION_ERROR" satisfies AppErrorType;

	const status = AppErrorStatusCode[errorType];

	return c.json(
		{
			error: {
				message: "Validation error occurred",
				type: errorType,
				status,
				// Error messages about the entire form
				formErrors: formErrors[0],
				// Key values for flattened field names and error messages
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
