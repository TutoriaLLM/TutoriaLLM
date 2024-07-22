import express from "express";
import { Level } from "level";
import type { SessionValue } from "../../type.js";
import joincodeGen from "../../utils/joincodeGen.js";

const DBrouter = express.Router();

//複数セッションを管理するのに使用するコードとデータを保存するDB
//export const sessionDB = new Level("dist/session", { valueEncoding: "json" });
//Redisに移行
import redis from "redis";
export const sessionDB = redis.createClient({
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT as unknown as number,
	},
});
await sessionDB.connect();
sessionDB.on("error", (err) => {
	console.log(`Error ${err}`);
});

function intitialData(code: string, language: string): SessionValue {
	return {
		sessioncode: code,
		uuid: crypto.randomUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
		dialogue: [
			{
				id: 0,
				contentType: "ai",
				isuser: false,
				content: "Welcome to the session! ",
			},
		],
		isReplying: false,
		workspace: {},
		isVMRunning: false,
		clients: [],
		language: language,
		llmContext: "",
		tutorial: {
			isTutorial: false,
			tutorialId: null,
			progress: 10,
		},
		stats: {
			totalConnectingTime: 0,
			currentNumOfBlocks: 0,
			totalInvokedLLM: 0,
			totalUserMessages: 0,
			totalCodeExecutions: 0,
		},
	};
}

DBrouter.get("/new", async (req, res) => {
	//参加コードを生成
	const code = joincodeGen();
	//言語をクエリから取得し、存在しない場合は英語をデフォルトとする
	let language = req.query.language;
	if (language === undefined || !language) {
		language = "en";
	}
	//生成したコードが重複していないか確認
	//const value = await sessionDB.get(code).catch(() => null);
	const value = await sessionDB.get(code);
	if (value === code) {
		res
			.status(500)
			.send("Failed to create session by api: code already exists");
		return;
	}
	// await sessionDB.put(
	// 	code,
	// 	JSON.stringify(intitialData(code, language.toString())),
	// );
	await sessionDB.set(
		code,
		JSON.stringify(intitialData(code, language.toString())),
	);
	console.log("session created by api");
	res.send(code);
});

//get value from key
DBrouter.get("/:key", async (req, res) => {
	try {
		//const value = await sessionDB.get(req.params.key);
		const value = await sessionDB.get(req.params.key);
		res.send(value);
	} catch (e) {
		res.status(404).send(null);
	}
});

//update value from key
DBrouter.put("/:key", async (req, res) => {
	const updateData: SessionValue = req.body;
	try {
		//await sessionDB.put(req.params.key, JSON.stringify(updateData));
		await sessionDB.set(req.params.key, JSON.stringify(updateData));
		res.send("Session updated by api");
	} catch (e) {
		res.status(404).send(null);
	}
});

//delete value from key
DBrouter.delete("/:key", async (req, res) => {
	try {
		//await sessionDB.get(req.params.key);
		await sessionDB.del(req.params.key);
		res.send("Session deleted");
	} catch (e) {
		res.status(404).send(null);
	}
});

DBrouter.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default DBrouter;
