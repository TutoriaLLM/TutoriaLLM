import type { UUID } from "node:crypto";
import type { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";

declare global {
	const app: Hono;
	const joinCode: string;
	const session: any;
	const serverRootPath: string;
	const upgradeWebSocket: UpgradeWebSocket;
}
