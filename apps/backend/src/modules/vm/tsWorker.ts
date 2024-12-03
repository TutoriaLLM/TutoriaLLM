import vm, { createContext } from "node:vm";
import path from "node:path";
import { parentPort, workerData } from "node:worker_threads";
import { ExtensionLoader } from "@/modules/vm/extensionLoader";
import { fileURLToPath } from "node:url";
import getPort, { portNumbers } from "get-port";
import { exec } from "node:child_process";
import os from "node:os";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import type { SessionValue } from "@/modules/session/schema";

const { joinCode, sessionValue, serverRootPath, userScript } = workerData;

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

app.get("/", (c) => {
	return c.html(
		/* html */ `<!doctype html>
		<html>
		  <head>
			<script src="https://cdn.tailwindcss.com"></script>
			<title>
				${sessionValue.sessioncode} - VM
			</title>
			<meta charset="utf-8" />
		  </head>
		  <body class="bg-white flex flex-col justify-center items-center w-full h-full">
			<div class="max-w-2xl w-full h-full rounded-2xl bg-gray-100 shadow p-2">
				<div class="rounded-2xl bg-gray-200 shadow-lg p-3">
					<h1 class="text-2xl">
					VM for ${sessionValue.sessioncode} is running!
					</h1>
					<p class="">
						This information is not synced with the server. To get the latest information, please stop and start the VM again. / このサーバーの情報は同期されていません。最新の情報を取得するには、VMを停止して再起動してください。
					<p class="">
					Dialogue:
					</p>
					<ul class="list-disc pl-5">
						${(sessionValue as SessionValue).dialogue
							?.map((d) => {
								if (d.contentType === "group_log") {
									return Array.isArray(d.content)
										? `<li>${d.content.map((c: { contentType: any; content: any }) => `<p>${c.contentType}: ${c.content}</p>`).join("")}</li>`
										: `<li>${d.content}</li>`;
								}
								return `<li>${d.contentType}: ${d.content}</li>`;
							})
							.join("")}
					</ul>
				</div>
				<div class="rounded-2xl bg-gray-200 shadow-lg p-3 flex flex-col gap-2 text-left">
					<h1 class="text-2xl">
					VM Debug information:
					</h1>
					<p class="">
					Server root path: ${serverRootPath}
					</p>
					<p class="">
					Join code: ${sessionValue.joinCode}
					</p>
					<code class="bg-gray-700 text-white rounded-2xl p-2">
					Running script: ${userScript}
					</code>
					<p class="">
					(Debug purpose) Session value:
					</p>
					<code class="bg-gray-700 text-white rounded-2xl p-2">
					${JSON.stringify(sessionValue)}
					</code>
				</div>
			</div>
		  </body>
		</html>
		`,
	);
});
// 新しいコンテキストを生成する関数
const context = createContext({
	app,
	upgradeWebSocket,
	joinCode,
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

const initialScript = /* javascript */ `
	${extScript}
function script() {
    ${userScript}
}
script();
`;

const script = new vm.Script(initialScript);
script.runInContext(context);

// 新しいコードを受信した場合、古いリスナーを削除して新しいコードを実行する
parentPort.on("message", (message) => {
	if (message.type === "updateScript") {
		try {
			const newScriptContent = /* javascript */ `
			removeListener();
			reRegisterOnConnectEvents();
			function script() {
			${message.code}
			}
			script();
			`;

			const newScript = new vm.Script(newScriptContent);
			newScript.runInContext(context);

			parentPort?.postMessage({
				type: "log",
				content: "vm.updatedScriptSuccess",
			});
		} catch (error) {
			parentPort?.postMessage({
				type: "error",
				//content: `Error executing updated script: ${error}`,
				content: `"vm.updatedScriptError", ${error}`,
			});
		}
	}
});

app.all("**", (c) => {
	return c.text("Not Found", 404);
});

export default app;
