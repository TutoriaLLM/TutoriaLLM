import vm, { createContext } from "node:vm";
import path from "node:path";
import { parentPort, workerData } from "node:worker_threads";
import { ExtensionLoader } from "../extentionLoader.js";
import { fileURLToPath } from "node:url";
import getPort, { portNumbers } from "get-port";
import { exec } from "node:child_process";
import os from "node:os";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import i18next from "i18next";
import I18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

const { code, sessionValue, serverRootPath, userScript } = workerData;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!parentPort) {
	throw new Error("parentPort is not defined");
}

export type vmMessage = {
	type: "log" | "error" | "openVM" | "info";
	content: string;
	port?: number;
	ip: string;
};

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// i18nの設定
i18next.use(I18NexFsBackend).init<FsBackendOptions>(
	{
		backend: {
			loadPath: "src/i18n/{{lng}}.json",
		},
		fallbackLng: "en",
		preload: ["ja", "en", "zh", "ms"],
	},
	(err, t) => {
		if (err) return console.error(err);
		console.log("i18next initialized");
	},
);

i18next.changeLanguage(sessionValue.language);

const { t } = i18next;

// 新しいコンテキストを生成する関数
const context = createContext({
	app,
	upgradeWebSocket,
	code,
	console: {
		log: (...args: string[]) => {
			const logMessage = args.join(" ");
			console.log(`log from VM: ${logMessage}`);
			parentPort?.postMessage({
				type: "log",
				content: logMessage,
			} as vmMessage);
		},
		error: (...args: string[]) => {
			const logMessage = args.join(" ");
			console.error(`error from VM: ${logMessage}`);
			parentPort?.postMessage({
				type: "error",
				content: logMessage,
			} as vmMessage);
		},
		info: (...args: string[]) => {
			const logMessage = args.join(" ");
			console.info(`info from VM: ${logMessage}`);
			parentPort?.postMessage({
				type: "info",
				content: logMessage,
			} as vmMessage);
		},
	},
	serverRootPath,
	t,
});

function getValidIp() {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		if (!interfaces[name]) continue;
		for (const net of interfaces[name]) {
			if (net.family === "IPv4" && !net.internal) {
				return net.address;
			}
		}
	}
	throw new Error("No valid IP address found");
}

async function startServer() {
	const ip = getValidIp();
	const port = await getPort({
		port: portNumbers(40000, 50000),
		host: ip,
	});

	const server = serve({
		fetch: app.fetch,
		port: port,
		hostname: ip,
		overrideGlobalObjects: true,
	});
	injectWebSocket(server);

	console.log(`Server with ws is listening with address: ${ip}:${port}`);
	parentPort?.postMessage({
		type: "openVM",
		port: port,
		ip: ip,
	} as vmMessage);
}

startServer();

const extensionsDir = path.resolve(__dirname, "../../../../extensions");
const extensionLoader = new ExtensionLoader(extensionsDir);
await extensionLoader.loadExtensions(context);
const extScript = await extensionLoader.loadScript();
console.log("userScript", userScript);

const initialScript = `
    ${extScript}
    ${userScript}
`;

const script = new vm.Script(initialScript);
script.runInContext(context);

// 新しいコードを受信した場合、そのコードの差分を適用する
parentPort.on("message", (message) => {
	if (message.type === "updateScript") {
		try {
			const newScriptContent = `
			${message.code}
			`;
			const newScript = new vm.Script(newScriptContent);
			newScript.runInContext(context);

			parentPort?.postMessage({
				type: "log",
				content: "Updated script executed successfully.",
			});
		} catch (error) {
			parentPort?.postMessage({
				type: "error",
				content: `Error executing updated script: ${error}`,
			});
		}
	}
});

app.all("**", (c) => {
	return c.text("Not Found", 404);
});

export default app;
