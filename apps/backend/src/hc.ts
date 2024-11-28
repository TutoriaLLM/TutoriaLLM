import { hc } from "hono/client";
import type { route, AppType } from ".";
import type { InferResponseType } from "hono";
import type { ClientResponse, InferRequestType } from "hono/client";
import type { AdminAppType } from "@/modules/admin";

const client = hc<AppType>("");
const adminClient = hc<AdminAppType>("");
export type Client = typeof client;
export type AdminClient = typeof adminClient;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<typeof route>(...args);
export const adminHcWithType = (...args: Parameters<typeof hc>): AdminClient =>
	hc<AdminAppType>(...args);

export type { InferResponseType, ClientResponse, InferRequestType };
