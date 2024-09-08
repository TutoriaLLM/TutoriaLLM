import express from "express";
import { Server } from "socket.io";
import { server, serverEmitter } from "../../main.js";
import i18next from "i18next";
import FsBackend, { type FsBackendOptions } from "i18next-fs-backend";
import type { Dialogue, SessionValue } from "../../../type.js";
import { updateDialogue } from "../../../utils/dialogueUpdater.js";
import { sessionDB } from "../../db/session.js";
import { ExecCodeTest, StopCodeTest, UpdateCodeTest } from "./vm/index.js";
import codeGen from "./codeGen.js";
import { updateStats } from "../../../utils/statsUpdater.js";
import updateDatabase from "./updateDB.js";
import { updateSession } from "./updateSession.js";
import { getConfig } from "../../getConfig.js";

const config = getConfig();

//debug
console.log("websocket/index.ts: Loading websocket app");

const wsServer = express.Router();
const clients = new Map<string, any>(); // socket.ioクライアントを管理するマップ

// i18n configuration
i18next.use(FsBackend).init<FsBackendOptions>(
	{
		backend: {
			loadPath: "src/i18n/{{lng}}.json",
		},
		fallbackLng: "en",
		preload: ["ja", "en", "zh", "ms"], // Add the languages you want to preload
	},
	(err, t) => {
		if (err) return console.error(err);
		console.log("i18next initialized");
	},
);

const io = new Server(server, {
	path: "/api/session/socket/connect",
});

io.on("connection", async (socket) => {
	console.log("new connection request from client");
	const code = socket.handshake.query.code as string;
	const uuid = socket.handshake.query.uuid as string;

	console.log("on connect:", code, uuid);
	try {
		// コードが存在しない場合は接続を拒否
		const value = await sessionDB.get(code);
		if (!value) {
			socket.emit("error", "Invalid code");
			socket.disconnect();
			return;
		}
		const data: SessionValue = JSON.parse(value);

		// uuidが一致しない場合は接続を拒否
		if (data.uuid !== uuid) {
			socket.emit("error", "Invalid uuid");
			socket.disconnect();
			return;
		}

		// WebSocketクライアントのIDを生成
		const clientId = `${uuid}-${Math.random().toString(36).substr(2, 9)}`;
		clients.set(clientId, socket);

		// クライアントIDをセッションに追加
		if (!data.clients.includes(clientId)) {
			data.clients.push(clientId);
			await sessionDB.set(code, JSON.stringify(data));
			console.log("client connected");
		}

		// Change language based on DB settings
		i18next.changeLanguage(data.language);

		socket.emit("PushCurrentSession", data);

		async function getCurrentDataJson(
			code: string,
		): Promise<SessionValue | null> {
			const currentData = await sessionDB.get(code);
			if (!currentData) {
				socket.emit("error", "Session not found");
				socket.disconnect();
				return null;
			}
			return JSON.parse(currentData);
		}

		//自動的に指定した分おきにスクリーンショットのリクエストを送信する
		const interval = config.Client_Settings.Screenshot_Interval_min || 1;
		const screenshotInterval = setInterval(
			() => {
				console.log(`Sending RequestScreenshot to client ${clientId}`);
				socket.emit("RequestScreenshot");
			},
			interval * 60 * 1000,
		); // 指定された分ごとにスクリーンショットをリクエスト

		socket.on("UpdateCurrentSession", async (message) => {
			console.log("UpdateCurrentSession");
			const messageJson: SessionValue = message;
			const currentDataJson = await getCurrentDataJson(code);
			if (!currentDataJson) {
				console.log("Session not found");
				socket.disconnect();
				return;
			}
			const isUpdated =
				JSON.stringify(messageJson) !== JSON.stringify(currentDataJson);

			if (isUpdated) {
				try {
					const messageJson: SessionValue = message;
					if (currentDataJson.uuid !== messageJson.uuid) {
						socket.emit("error", "Invalid uuid");
						socket.disconnect();
					}

					updateSession(clients, currentDataJson, messageJson)
						.then(() => {
							console.log("Session updated");
						})
						.catch((error) => {
							console.error("Error updating session:", error);
						});
				} catch (error) {
					console.error("Error handling message:", error);
					socket.emit("error", "Server error");
				}
			}
		});
		socket.on("openVM", async () => {
			console.log("openVM");
			const currentDataJson = await getCurrentDataJson(code);
			if (!currentDataJson) {
				console.log("Session not found");
				socket.disconnect();
				return;
			}
			let isRunning = currentDataJson.isVMRunning;
			const serializedWorkspace = currentDataJson.workspace;

			const generatedCode = await codeGen(
				serializedWorkspace,
				currentDataJson.language,
			);

			if (generatedCode === (undefined || null || "")) {
				isRunning = false;
				currentDataJson.isVMRunning = isRunning;
				await updateDatabase(code, currentDataJson, clients);
				updateDatabase(
					code,
					updateDialogue(
						i18next.t("error.empty_code"),
						currentDataJson,
						"error",
					),
					clients,
				);
				sendToAllClients(currentDataJson);
				return;
			}
			console.log("test code received. Executing...");
			const serverRootPath = `${socket.request.headers.host}`;
			const result = await ExecCodeTest(
				code,
				currentDataJson.uuid,
				generatedCode,
				serverRootPath,
				clients,
				updateDatabase,
			);
			if (result === "Valid uuid") {
				console.log("Script is running...");
				isRunning = true;
				currentDataJson.isVMRunning = isRunning;
				await updateDatabase(code, currentDataJson, clients);
				console.log("sending to all clients true");
				sendToAllClients(currentDataJson);
			} else {
				console.log(result);
				isRunning = false;
				currentDataJson.isVMRunning = isRunning;
				await updateDatabase(code, currentDataJson, clients);
				console.log("sending to all clients false");
				sendToAllClients(currentDataJson);
			}
		});
		socket.on("updateVM", async () => {
			console.log("updateVM");
			const currentDataJson = await getCurrentDataJson(code);
			if (!currentDataJson) {
				console.log("Session not found");
				socket.disconnect();
				return;
			}
			const generatedCode = await codeGen(
				currentDataJson.workspace,
				currentDataJson.language,
			);
			const result = await UpdateCodeTest(
				code,
				currentDataJson.uuid,
				generatedCode,
			);
			console.log(result);
		});
		socket.on("stopVM", async () => {
			console.log("stopVM");
			const currentDataJson = await getCurrentDataJson(code);
			if (!currentDataJson) {
				console.log("Session not found");
				socket.disconnect();
				return;
			}
			let isRunning = currentDataJson.isVMRunning;
			const result = await StopCodeTest(code, uuid, clients, updateDatabase);
			console.log(result);
			isRunning = false;
			currentDataJson.isVMRunning = isRunning;

			sendToAllClients(currentDataJson);
			const currentDataJsonWithUpdatedStats = updateStats(
				{
					totalCodeExecutions: currentDataJson.stats.totalCodeExecutions + 1,
				},
				currentDataJson,
			);
			await updateDatabase(code, currentDataJsonWithUpdatedStats, clients);
		});

		socket.on("disconnect", async () => {
			console.log("disconnected client");
			clearInterval(screenshotInterval);
			try {
				const currentData = await sessionDB.get(code);
				if (!currentData) {
					return;
				}
				const currentDataJson: SessionValue = JSON.parse(currentData);
				currentDataJson.clients = currentDataJson.clients.filter(
					(id) => id !== clientId,
				);
				clients.delete(clientId); // マップから削除

				//VMが実行中かつすべてのクライアントが切断された場合、VMを停止する
				console.log(
					currentDataJson.isVMRunning,
					currentDataJson.clients.length,
				);
				if (
					currentDataJson.isVMRunning &&
					currentDataJson.clients.length === 0
				) {
					const result = await StopCodeTest(
						code,
						uuid,
						clients,
						updateDatabase,
					);
					console.log(`${result.message} VM stopped. no clients connected.`);
					currentDataJson.isVMRunning = false;
				}
				await sessionDB.set(code, JSON.stringify(currentDataJson));
			} catch (error) {
				console.error("Error closing connection:", error);
			}
		});
	} catch (error) {
		console.log("Error connecting:", error);
		socket.emit("error", "Server error");
		socket.disconnect();
	}
});

// 接続コードを元にUUIDを応答する
wsServer.get("/get/:code", async (req, res) => {
	const code = req.params.code;

	try {
		const value = await sessionDB.get(code).catch(() => null);
		if (!value) {
			res.status(404).send("Session not found");
			return;
		}

		const data: SessionValue = JSON.parse(value);
		if (!data.uuid) {
			res.status(500).send("Session uuid is invalid or not found");
			return;
		}

		res.json({ uuid: data.uuid });
	} catch (error) {
		console.error("Error getting session:", error);
		res.status(500).send("Server error");
	}
});

wsServer.get("/hello", async (req, res) => {
	res.send("hello");
});

function sendToAllClients(session: SessionValue) {
	for (const id of session.clients) {
		if (clients?.has(id)) {
			clients.get(id)?.emit("PushCurrentSession", session);
		}
	}
}

export default wsServer;
