import type { AdminAppType } from "@/modules/admin";
import type { InferResponseType } from "hono";
import { hc } from "hono/client";
import type { ClientResponse, InferRequestType } from "hono/client";
import type { AppType, route } from ".";

const client = hc<AppType>("");
const adminClient = hc<AdminAppType>("");
export type Client = typeof client;
export type AdminClient = typeof adminClient;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<typeof route>(...args);
export const adminHcWithType = (...args: Parameters<typeof hc>): AdminClient =>
	hc<AdminAppType>(...args);

export type { InferResponseType, ClientResponse, InferRequestType };
