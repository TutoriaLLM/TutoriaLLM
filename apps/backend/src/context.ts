import type { Env } from "hono";

export interface Context extends Env {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	Variables: {};
}
