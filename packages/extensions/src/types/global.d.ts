import type { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";

declare global {
	// const context: extScriptContext;
	const app: Hono;
	const joinCode: string;
	const session: any;
	const serverRootPath: string;
	const randomUUID: typeof import("crypto").randomUUID;
	const upgradeWebSocket: UpgradeWebSocket;
	// const console: {
	// 	log: (...args: string[]) => void;
	// 	error: (...args: string[]) => void;
	// 	info: (...args: string[]) => void;
	// };
}
