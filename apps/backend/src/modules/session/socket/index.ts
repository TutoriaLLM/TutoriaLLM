import type { Server as HttpServer } from "node:http";
import { db } from "@/db";
import codeGen from "@/libs/blocklyCodeGenerator";
import { getConfig } from "@/modules/config";
import { updateSession } from "@/modules/session/socket/sessionUpdator";
import { ExecCodeTest, StopCodeTest, UpdateCodeTest } from "@/modules/vm";
import { updateDialogue } from "@/utils/dialogueUpdater";
import { updateStats } from "@/utils/statsUpdater";
import type { Operation } from "rfc6902";
import { Server } from "socket.io";

import type { SessionValue } from "@/modules/session/schema";
import {
	updateAndBroadcastDiff,
	updateAndBroadcastDiffToAll,
} from "@/modules/session/socket/updateDB";
import { eq } from "drizzle-orm";
import { appSessions } from "@/db/schema";

const config = getConfig();

let io: Server | null = null;

export function initSocketServer(server: HttpServer) {
	io = new Server(server, {
		cors: {
			origin: "*",
		},
		path: "/session/socket/connect",
	});

	io.on("connection", async (socket) => {
		console.info("new connection request from client");
		const sessionId = socket.handshake.query.sessionId as string;

		try {
			// If the code does not exist, the connection is rejected
			// Migrated from Redis to Postgres: from 1.0.0
			const data = await db.query.appSessions.findFirst({
				where: eq(appSessions.sessionId, sessionId),
			});

			// Connection denied if sessionId does not match
			if (data?.sessionId !== sessionId) {
				socket.emit("error", "Invalid sessionId");
				socket.disconnect();
				return;
			}

			socket.join(data.sessionId);

			const dataWithNewClient = {
				...data,
				clients: [...(data.clients || []), socket.id],
			};

			socket.emit("PushCurrentSession", dataWithNewClient);

			// Add Client
			updateAndBroadcastDiffToAll(
				sessionId,
				dataWithNewClient, // Data with additional clients
				socket,
			);

			async function getCurrentDataJson(
				sessionId: string,
			): Promise<SessionValue | null> {
				// Migrated from Redis to Postgres: from 1.0.0
				const data = await db.query.appSessions.findFirst({
					where: eq(appSessions.sessionId, sessionId),
				});
				if (!data) {
					socket.emit("error", "Session not found");
					socket.disconnect();
					return null;
				}
				return data;
			}

			// Automatically send screenshot requests every specified minute
			const interval = config.Client_Settings.Screenshot_Interval_min || 1;
			const screenshotInterval = setInterval(
				() => {
					socket.emit("RequestScreenshot");
				},
				interval * 60 * 1000,
			); // Request screenshots every specified minute

			socket.on("UpdateCurrentSessionDiff", async (diff: Operation[]) => {
				const currentDataJson = await getCurrentDataJson(sessionId);
				if (!currentDataJson) {
					socket.disconnect();
					return;
				}

				try {
					await updateSession(currentDataJson, diff, socket);
				} catch (error) {
					console.error("Error updating session:", error);
					socket.emit("error", "Server error");
				}
			});
			socket.on("openVM", async () => {
				const currentDataJson = await getCurrentDataJson(sessionId);
				if (!currentDataJson) {
					socket.disconnect();
					return;
				}
				let isRunning = currentDataJson.isVMRunning;
				const serializedWorkspace = currentDataJson.workspace;

				if (!serializedWorkspace) {
					isRunning = false;
					currentDataJson.isVMRunning = isRunning;
					updateAndBroadcastDiffToAll(
						sessionId,
						updateDialogue("error.empty_workspace", currentDataJson, "error"),
						socket,
					);
					return;
				}

				const generatedCode = await codeGen(
					serializedWorkspace,
					currentDataJson.language || "en",
				);

				if (
					generatedCode === undefined ||
					generatedCode === null ||
					generatedCode === ""
				) {
					isRunning = false;
					currentDataJson.isVMRunning = isRunning;
					updateAndBroadcastDiffToAll(
						sessionId,
						updateDialogue("error.empty_code", currentDataJson, "error"),
						socket,
					);
					return;
				}
				const serverRootPath = `${socket.request.headers.host}`;
				const result = await ExecCodeTest(
					currentDataJson.sessionId,
					generatedCode,
					serverRootPath,
					socket,
					updateAndBroadcastDiffToAll,
				);
				if (result === "Valid sessionId") {
					isRunning = true;
					currentDataJson.isVMRunning = isRunning;
					await updateAndBroadcastDiffToAll(sessionId, currentDataJson, socket);
				} else {
					isRunning = false;
					currentDataJson.isVMRunning = isRunning;
					await updateAndBroadcastDiffToAll(sessionId, currentDataJson, socket);
				}
			});
			socket.on("updateVM", async (callback) => {
				const currentDataJson = await getCurrentDataJson(sessionId);
				if (!currentDataJson?.workspace) {
					socket.disconnect();
					return;
				}
				const generatedCode = await codeGen(
					currentDataJson.workspace,
					currentDataJson.language || "en",
				);
				const result = await UpdateCodeTest(
					currentDataJson.sessionId,
					generatedCode,
				);
				callback("ok");
			});
			socket.on("stopVM", async () => {
				const currentDataJson = await getCurrentDataJson(sessionId);
				if (!currentDataJson) {
					socket.disconnect();
					return;
				}
				let isRunning = currentDataJson.isVMRunning;
				await StopCodeTest(sessionId, socket, updateAndBroadcastDiffToAll);
				isRunning = false;
				currentDataJson.isVMRunning = isRunning;

				const currentDataJsonWithUpdatedStats = updateStats(
					{
						totalCodeExecutions: currentDataJson.stats.totalCodeExecutions + 1,
					},
					currentDataJson,
				);
				await updateAndBroadcastDiffToAll(
					sessionId,
					currentDataJsonWithUpdatedStats,
					socket,
				);
			});

			socket.on("disconnect", async () => {
				clearInterval(screenshotInterval);
				try {
					// Migrated from Redis to Postgres: from 1.0.0
					const rawData = await db
						.select()
						.from(appSessions)
						.where(eq(appSessions.sessionId, sessionId));

					const currentData: SessionValue = rawData[0];

					if (!currentData) {
						return;
					}
					const currentDataJson: SessionValue = currentData;

					if (currentDataJson.clients) {
						currentDataJson.clients = currentDataJson.clients.filter(
							(id) => id !== socket.id,
						);
					}

					// If a VM is running and all clients are disconnected, stop the VM
					if (
						currentDataJson.isVMRunning &&
						currentDataJson?.clients?.length === 0
					) {
						const result = await StopCodeTest(
							sessionId,
							socket,
							updateAndBroadcastDiff,
						);
						currentDataJson.isVMRunning = false;
					}
					await updateAndBroadcastDiffToAll(sessionId, currentDataJson, socket);
				} catch (error) {
					console.error("Error closing connection:", error);
				}
			});
		} catch {
			socket.emit("error", "Server error");
			socket.disconnect();
		}
	});
}
