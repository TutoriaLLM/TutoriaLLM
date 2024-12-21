import { z } from "@hono/zod-openapi";

export const StatusCheckSchema = z.object({
	status: z.string(),
});
