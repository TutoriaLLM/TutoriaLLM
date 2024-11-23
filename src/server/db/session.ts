import express from "express";
import { Level } from "level";
import type { SessionValue } from "../../type.js";
import joincodeGen from "../../utils/joincodeGen.js";

//debug
console.log("db/session.ts: Loading db app");

const DBrouter = express.Router();
DBrouter.use(apiLimiter());
DBrouter.use(express.json());

import i18next from "i18next";
import apiLimiter from "../ratelimit.js";

//RedisからPostgresに移行しました: from 1.0.0
import { db } from "./index.js";
import { appSessions, type AppSession } from "./schema.js"; //DBとやりとりする際に使う型（フロントエンドで利用しているSessionValueとほぼ同じ）
import { eq } from "drizzle-orm";

function initialData(code: string, language: string): AppSession {
	i18next.changeLanguage(language);

	const { t } = i18next;
	const quickReplyByLang = [
		t("quickReply.WhatINeed"),
		t("quickReply.HowToUse"),
		t("quickReply.BeginTutorial"),
	];
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
				content: t("dialogue.Introduction"),
			},
		],
		quickReplies: quickReplyByLang,
		isReplying: false,
		easyMode: false,
		responseMode: "text",
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
		audios: [],
		userAudio: "",
		screenshot: "",
		clicks: [],
	};
}

/**
 * @openapi
 * components:
 *   schemas:
 *     SessionValue:
 *       type: object
 *       properties:
 *         sessioncode:
 *           type: string
 *         uuid:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         dialogue:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               contentType:
 *                 type: string
 *               isuser:
 *                 type: boolean
 *               content:
 *                 type: string
 *         quickReplies:
 *           type: array
 *           items:
 *             type: string
 *         isReplying:
 *           type: boolean
 *         easyMode:
 *           type: boolean
 *         responseMode:
 *           type: string
 *         workspace:
 *           type: object
 *         isVMRunning:
 *           type: boolean
 *         clients:
 *           type: array
 *           items:
 *             type: string
 *         language:
 *           type: string
 *         llmContext:
 *           type: string
 *         tutorial:
 *           type: object
 *           properties:
 *             isTutorial:
 *               type: boolean
 *             tutorialId:
 *               type: string
 *               nullable: true
 *             progress:
 *               type: integer
 *         stats:
 *           type: object
 *           properties:
 *             totalConnectingTime:
 *               type: integer
 *             currentNumOfBlocks:
 *               type: integer
 *             totalInvokedLLM:
 *               type: integer
 *             totalUserMessages:
 *               type: integer
 *             totalCodeExecutions:
 *               type: integer
 *         audios:
 *           type: array
 *           items:
 *             type: string
 *         userAudio:
 *           type: string
 *         screenshot:
 *           type: string
 *         clicks:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @openapi
 * /session/new:
 *   post:
 *     description: Creates a new session with optional session data.
 *     parameters:
 *       - name: language
 *         in: query
 *         description: Language code to initialize the session.
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionValue'
 *     responses:
 *       200:
 *         description: Successfully created a new session.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Generated session code
 *       500:
 *         description: Failed to create session by API.
 */
DBrouter.post("/new", async (req, res) => {
	let language = req.query.language;
	const sessionData = req.body as AppSession;

	if (sessionData?.uuid && !language) {
		console.log("session created with data");
		const code = joincodeGen();
		console.log("sessionData", sessionData);

		const { t } = i18next;
		i18next.changeLanguage(sessionData.language);
		//RedisからPostgresに移行しました: from 1.0.0
		await db.insert(appSessions).values({
			...sessionData,
			sessioncode: code,
			dialogue: [
				...sessionData.dialogue,
				{
					id: sessionData.dialogue.length + 1,
					contentType: "log",
					isuser: false,
					content: t("dialogue.NewSessionWithData"),
				},
			],
			clients: [],
			updatedAt: new Date(),
			screenshot: "",
			clicks: [],
		});
		res.send(sessionData.sessioncode);
		return;
	}

	if (language === undefined || !language) {
		language = "en";
	}

	const code = joincodeGen();

	console.log("session created with initial data");

	//既に同じコードのセッションが存在する場合はエラーを返す
	const value = await db
		.select()
		.from(appSessions)
		.where(eq(appSessions.sessioncode, code));

	if (value[0]?.sessioncode === code) {
		res
			.status(500)
			.send("Failed to create session by api: code already exists");
		return;
	}

	//RedisからPostgresに移行しました: from 1.0.0
	await db
		.insert(appSessions)
		.values(initialData(code, language.toString()))
		.execute();
	console.log("session created by api");
	res.send(code);
});

/**
 * @openapi
 * /session/{key}:
 *   get:
 *     description: Retrieves the session data for the given key.
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved session data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionValue'
 *       404:
 *         description: Session not found.
 */
DBrouter.get("/:key", async (req, res) => {
	try {
		// RedisからPostgresに移行しました: from 1.0.0
		const value = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.sessioncode, req.params.key));
		res.send(value[0]);
	} catch (e) {
		res.status(404).send(null);
	}
});

/**
 * @openapi
 * /session/{key}:
 *   put:
 *     description: Updates the session data for the given key.
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionValue'
 *     responses:
 *       200:
 *         description: Successfully updated session data.
 *       404:
 *         description: Session not found.
 */
DBrouter.put("/:key", async (req, res) => {
	const updateData: SessionValue = req.body;
	try {
		//RedisからPostgresに移行しました: from 1.0.0
		await db
			.update(appSessions)
			.set(updateData)
			.where(eq(appSessions.sessioncode, req.params.key));
		res.send("Session updated by api");
	} catch (e) {
		res.status(404).send(null);
	}
});

/**
 * @openapi
 * /session/{key}:
 *   delete:
 *     description: Deletes the session data for the given key.
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted session data.
 *       404:
 *         description: Session not found.
 */
DBrouter.delete("/:key", async (req, res) => {
	try {
		//RedisからPostgresに移行しました: from 1.0.0
		await db
			.delete(appSessions)
			.where(eq(appSessions.sessioncode, req.params.key));
		res.send("Session deleted");
	} catch (e) {
		res.status(404).send(null);
	}
});

DBrouter.all("*", (req, res) => {
	res.status(404).send("Not Found");
});

export default DBrouter;
