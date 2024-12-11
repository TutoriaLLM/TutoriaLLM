import type { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";
import type { UUID } from "node:crypto";

declare global {
	const app: Hono;
	const joinCode: string;
	const session: any;
	const serverRootPath: string;
	const upgradeWebSocket: UpgradeWebSocket;
}
