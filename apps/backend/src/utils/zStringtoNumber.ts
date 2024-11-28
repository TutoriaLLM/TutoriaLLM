import { z } from "@hono/zod-openapi";

export const stringToNumber = z.preprocess((v) => Number(v), z.number());
