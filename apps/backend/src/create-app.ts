import { OpenAPIHono } from "@hono/zod-openapi";
import type { Schema } from "hono";
import { defaultHook } from "@/libs/default-hook";
import type { Context } from "./context";

export class CustomHono<
	E extends Context = Context,
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	S extends Schema = {},
	BasePath extends string = "/",
> extends OpenAPIHono<E, S, BasePath> {}

/**
 * Returns an OpenAPIHono instance with shared default settings
 * to avoid setting `defaultHook` and similar options every time.
 * In the future, consider using the OpenAPI version of `factory.createApp`
 * if it becomes available.
 * @see https://github.com/honojs/middleware/issues/652
 */
export const createHonoApp = () => new CustomHono({ defaultHook });
