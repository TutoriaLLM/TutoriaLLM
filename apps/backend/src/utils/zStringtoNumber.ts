import { z } from "@hono/zod-openapi";

// export const stringToNumber = z.preprocess((v) => Number(v), z.number());
export const stringToNumber = z
	.string()
	.pipe(z.coerce.number())
	.openapi({ type: "integer" });
