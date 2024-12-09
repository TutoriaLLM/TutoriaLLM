import { OpenAPIHono } from "@hono/zod-openapi";
import {
	getSession,
	newSession,
	putSession,
	deleteSession,
	resumeSession,
} from "@/modules/session/routes";
import joincodeGen from "@/utils/joincodeGen";
import { db } from "@/db";
import { appSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initialData } from "@/db/session";
import { errorResponse } from "@/libs/errors";
import type { Context } from "@/context";
import { defaultHook } from "@/libs/default-hook";

const app = new OpenAPIHono<Context>({ defaultHook })
	.openapi(newSession, async (c) => {
		let language = c.req.valid("query").language;

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
	.openapi(resumeSession, async (c) => {
		const sessionData = c.req.valid("json");
		console.log("session created with data");
		const code = joincodeGen();
		console.log("sessionData", sessionData);

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
						content: "dialogue.NewSessionWithData",
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
		return c.json(data, 200);
	});

export default app;
