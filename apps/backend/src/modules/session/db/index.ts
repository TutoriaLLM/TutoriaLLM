import { OpenAPIHono } from "@hono/zod-openapi";
import { getSession, newSession, putSession, deleteSession } from "./routes";
import joincodeGen from "../../../utils/joincodeGen";
import i18next from "i18next";
import { db } from "../../../db";
import {
	type AppSession,
	appSessions,
	SelectAppSession,
} from "../../../db/schema";
import { eq } from "drizzle-orm";
import { initialData } from "../../../db/session";
import { errorResponse } from "../../../libs/errors";
import { sessionValueSchema } from "./schema";
const app = new OpenAPIHono()
	.openapi(newSession, async (c) => {
		const sessionData = c.req.valid("json");
		let language = c.req.valid("query").language;
		if (sessionData?.uuid && !language) {
			console.log("session created with data");
			const code = joincodeGen();
			console.log("sessionData", sessionData);

			const { t } = i18next;
			i18next.changeLanguage(sessionData.language ?? "en");
			//RedisからPostgresに移行しました: from 1.0.0
			const {
				uuid,
				dialogue,
				quickReplies,
				workspace,
				language,
				easyMode,
				responseMode,
				llmContext,
				tutorial,
				stats,
				clicks,
			} = sessionData;
			await db
				.insert(appSessions)
				.values({
					sessioncode: code,
					uuid,
					createdAt: new Date(),
					updatedAt: new Date(),
					...(quickReplies && { quickReplies }),
					dialogue: [
						...(dialogue ?? []),
						{
							id: (dialogue?.length ?? 0) + 1,
							contentType: "log",
							isuser: false,
							content: t("dialogue.NewSessionWithData"),
						},
					],
					isReplying: false,
					workspace,
					isVMRunning: false,
					clients: [],
					language,
					easyMode,
					responseMode,
					llmContext,
					tutorial,
					stats: stats ?? {
						audios: [],
						userAudio: "",
						screenshot: "",
						clicks: clicks ?? [],
					},
				})
				.execute();
			return c.text(code, 200);
		}

		if (language === undefined || !language) {
			language = "en";
		}

		const code = joincodeGen();

		console.log("session created with initial data");

		//既に同じコードのセッションが存在する場合はエラーを返す
		const value = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessioncode, code),
		});

		if (value?.sessioncode === code) {
			return errorResponse(c, {
				message: "Session code already exists",
				type: "BAD_REQUEST",
			});
		}

		//RedisからPostgresに移行しました: from 1.0.0
		//初期データが指定されていない場合は、初期データを生成し、セッションを作成する
		await db
			.insert(appSessions)
			.values(initialData(code, language.toString()))
			.execute();
		console.log("session created by api");
		return c.text(code, 200);
	})
	.openapi(putSession, async (c) => {
		const key = c.req.valid("param").key;
		const sessionData = c.req.valid("json");
		// RedisからPostgresに移行しました: from 1.0.0
		const existingSession = await db.query.users.findFirst({
			where: eq(appSessions.sessioncode, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		await db
			.update(appSessions)
			.set(sessionData)
			.where(eq(appSessions.sessioncode, key));
		return c.text("Session updated", 200);
	})
	.openapi(deleteSession, async (c) => {
		const key = c.req.valid("param").key;
		// RedisからPostgresに移行しました: from 1.0.0
		const existingSession = await db.query.users.findFirst({
			where: eq(appSessions.sessioncode, key),
		});
		if (!existingSession) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		await db.delete(appSessions).where(eq(appSessions.sessioncode, key));
		return c.text("Session deleted", 200);
	})
	.openapi(getSession, async (c) => {
		const key = c.req.valid("param").key;
		//RedisからPostgresに移行しました: from 1.0.0
		const data = await db.query.appSessions.findFirst({
			where: eq(appSessions.sessioncode, key),
		});
		if (!data) {
			return errorResponse(c, {
				message: "Session not found",
				type: "NOT_FOUND",
			});
		}
		data.userAudio;
		return c.json(data, 200);
	});

export default app;
