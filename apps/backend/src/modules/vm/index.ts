import { createServer } from "node:http";
import type { Socket as nodeSocket } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { db } from "@/db";
import { getConfig } from "@/modules/config";
import type { SessionValue } from "@/modules/session/schema";
import LogBuffer from "@/modules/vm/logBuffer";
import type { vmMessage } from "@/modules/vm/tsWorker";
import { type HttpBindings, serve } from "@hono/node-server";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Socket } from "socket.io";
import { appSessions } from "@/db/schema/session";
// Get `__dirname`.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface to manage VM instances
interface VMInstance {
	running: boolean;
	worker: Worker;
	port?: number;
	ip?: string;
}

// Objects that manage VM instances
const vmInstances: { [key: string]: VMInstance } = {};

// Objects that tie and manage VM sessionId and proxies
const vmProxies = new Map<string, any>();
// Function to add a new proxy to the list when creating a VM instance
function setupVMProxy(sessionId: string) {
	vmProxies.set(sessionId, proxy);
}
// Function to delete proxy when VM instance is stopped
function removeVMProxy(sessionId: string) {
	vmProxies.delete(sessionId);
}

let vmPort = 3002;
if (process.env.VM_PORT) {
	const basePort = Number.parseInt(process.env.VM_PORT, 10); // Interpreted as a decimal number
	if (!Number.isNaN(basePort)) {
		// Check if basePort is not NaN
		vmPort = basePort;
	}
}

const app = new Hono<{ Bindings: HttpBindings }>();
// Maps that store proxies for participation sessionId
const proxy = createProxyMiddleware({
	router: async (req) => {
		const sessionIdPath = req.url?.split("/")[1];
		if (!sessionIdPath) {
			return;
		}

		const session = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessionId, sessionIdPath));

		const sessionId = session[0].sessionId;
		const instance = vmInstances[sessionId];
		if (instance) {
			return `http://${instance.ip}:${instance.port}`;
		}
		return;
	},
	pathRewrite: (path, req) => {
		return path.replace(req.url?.split("/")[1] || "", "");
	},
	ws: true,
	logger: console,
});

const server = serve({
	fetch: app.fetch,
	overrideGlobalObjects: false,
	port: vmPort,
	createServer: createServer,
});
server.on("upgrade", (req, socket, head) => {
	proxy.upgrade(req, socket as nodeSocket, head);
});

app.all("/:sessionId", async (c, next) => {
	const sessionId = c.req.param("sessionId");
	if (!sessionId) {
		c.status(400);
		return;
	}

	if (vmProxies.has(sessionId)) {
		return new Promise((resolve, reject) => {
			try {
				proxy(c.env.incoming, c.env.outgoing, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			} catch (e) {
				reject(e);
			}
		});
	}
	return c.status(404);
});

export async function ExecCodeTest(
	sessionId: string,
	userScript: string,
	serverRootPath: string,
	socket: Socket,
	DBupdator: (
		sessionId: string,
		newData: SessionValue,
		socket: Socket,
	) => Promise<void>,
): Promise<string> {
	const session = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessionId, sessionId));
	if (!session) {
		return "Invalid session";
	}
	const sessionValue: SessionValue = session[0];
	if (sessionValue.sessionId !== sessionId) {
		return "Invalid sessionId";
	}

	const logBuffer = new LogBuffer(
		async (sessionId, logs) => {
			const session = await db
				.select()
				.from(appSessions)
				.where(eq(appSessions.sessionId, sessionId));
			if (!session) {
				return;
			}
			const sessionValue: SessionValue = session[0];
			sessionValue.dialogue?.push(logs);
			await DBupdator(sessionId, sessionValue, socket);
		},
		sessionId,
		async () => {
			const session = await db
				.select()
				.from(appSessions)
				.where(eq(appSessions.sessionId, sessionId));
			return session[0];
		},
	);

	try {
		// Load config.
		const config = getConfig();

		const joinSessionId = sessionId;

		const worker = new Worker(path.resolve(__dirname, "./worker.mjs"), {
			workerData: { joinSessionId, sessionValue, serverRootPath, userScript },
			resourceLimits: {
				codeRangeSizeMb: config.Code_Execution_Limits.Max_CodeRangeSizeMb,
				maxOldGenerationSizeMb:
					config.Code_Execution_Limits.Max_OldGenerationSizeMb,
				maxYoungGenerationSizeMb:
					config.Code_Execution_Limits.Max_YoungGenerationSizeMb,
			},
		});

		worker.on("message", (msg: vmMessage) => {
			if (msg.type === "log") logBuffer.add(msg.content);
			if (msg.type === "error") logBuffer.error(msg.content);
			if (msg.type === "info") logBuffer.info(msg.content);

			if (msg.type === "openVM") {
				const port = msg.port;
				const ip = msg.ip;
				if (!port) {
					return;
				}

				// Save IP and port in vmInstances
				vmInstances[sessionId].port = port;
				vmInstances[sessionId].ip = ip;

				// Proxy Settings
				setupVMProxy(sessionId);
			}
		});

		worker.on("error", (err) => {
			if (err.toString().includes("ERR_WORKER_OUT_OF_MEMORY")) {
				logBuffer.error(`${"vm.outOfMemory"} (${err.message})`);
			} else {
				logBuffer.error(`${err.message}`);
			}
		});

		worker.on("exit", (exitcode) => {
			logBuffer.stop();
			StopCodeTest(sessionId, socket, DBupdator);
		});

		// Save worker instance
		vmInstances[sessionId] = { running: true, worker: worker };
	} catch (e) {
		await StopCodeTest(sessionId, socket, DBupdator);
	}

	logBuffer.start();

	return "Valid sessionId";
}

// Function to update code through Worker running in ExecCodeTest
export async function UpdateCodeTest(
	sessionId: string,
	newUserScript: string,
): Promise<string> {
	const instance = vmInstances[sessionId];
	if (instance?.running) {
		const session = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessionId, sessionId));
		if (!session) {
			return "Invalid session";
		}
		const sessionValue: SessionValue = session[0];
		if (sessionValue.sessionId !== sessionId) {
			return "Invalid sessionId";
		}
		// Send new code to Worker
		instance.worker.postMessage({
			type: "updateScript",
			code: newUserScript,
		});
		return "Script updated successfully.";
	}
	return "Script is not running.";
}

// Modified StopCodeTest function
export async function StopCodeTest(
	sessionId: string,
	socket: Socket,
	DBupdator: (
		sessionId: string,
		newData: SessionValue,
		socket: Socket,
	) => Promise<void>,
): Promise<{ message: string; error: string }> {
	const instance = vmInstances[sessionId];
	if (instance?.running) {
		instance.running = false;
		const session = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessionId, sessionId));
		if (!session) {
			return {
				message: "Invalid session",
				error: "Invalid session",
			};
		}
		if (session[0].sessionId !== sessionId) {
			return {
				message: "Invalid sessionId",
				error: "Invalid sessionId",
			};
		}

		// Exit Worker
		await instance.worker.terminate();

		// Clear proxies
		// const stack = vmExpress._router.stack;
		// for (let i = stack.length - 1; i >= 0; i--) {
		// 	const layer = stack[i];
		// 	if (layer.route?.path?.toString().includes(code)) {
		// 		stack.splice(i, 1);
		// 	}
		// }

		// Remove proxy from HONO router
		// const stack = app.routes;
		// for (let i = stack.length - 1; i >= 0; i--) {
		// 	const layer = stack[i];
		// 	if (layer.path?.toString().includes(code)) {
		// 		stack.splice(i, 1);
		// 	}
		// }

		// Delete proxy
		removeVMProxy(sessionId);
		delete vmInstances[sessionId];

		// Update DB and notify client
		const sessionValue: SessionValue = session[0];
		sessionValue.isVMRunning = false;
		await DBupdator(sessionId, sessionValue, socket);
		return {
			message: "Script execution stopped successfully.",
			error: "",
		};
	}
	return {
		message: "Script is not running.",
		error: "Script is not running.",
	};
}
