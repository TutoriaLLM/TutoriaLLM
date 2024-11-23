import { hc } from "hono/client";
import type { route, AppType } from "./index.js";
import type { InferResponseType } from "hono";
import type { ClientResponse, InferRequestType } from "hono/client";

const client = hc<AppType>("");

export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<typeof route>(...args);

export type { InferResponseType, ClientResponse, InferRequestType };
