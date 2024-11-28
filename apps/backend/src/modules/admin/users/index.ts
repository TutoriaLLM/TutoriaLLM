import { saltAndHashPassword } from "../../../utils/password.js";
// 既存のDBに接続する
import { eq } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { authSessions, users } from "../../../db/schema.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
	createUser,
	deleteUser,
	getUser,
	getUserList,
	updateUser,
} from "./routes.js";
import { errorResponse } from "../../../libs/errors/index.js";

import type { Context } from "../../../context";
import { defaultHook } from "../../../libs/default-hook";

const app = new OpenAPIHono<Context>({ defaultHook })
	.openapi(getUserList, async (c) => {
		const getUsers = await db
			.select({
				id: users.id,
				username: users.username,
			})
			.from(users);
		return c.json(getUsers, 200);
	})

	.openapi(createUser, async (c) => {
		const { username, password } = c.req.valid("json");
		const hashedPassword = await saltAndHashPassword(password);
		const insert = await db
			.insert(users)
			.values({
				username: username,
				password: hashedPassword,
			})
			.returning({
				username: users.username,
				id: users.id,
			});
		if (insert === undefined) {
			return errorResponse(c, {
				message: "Failed to create user",
				type: "SERVER_ERROR",
			});
		}
		const createdUser = insert[0];
		return c.json(createdUser, 200);
	})

	.openapi(getUser, async (c) => {
		const id = c.req.valid("param").id;
		const user = await db.query.users.findFirst({
			where: eq(users.id, id),
		});
		if (!user) {
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		}
		const { password, ...userWithoutPassword } = user;
		return c.json(userWithoutPassword, 200);
	})

	.openapi(updateUser, async (c) => {
		const id = c.req.valid("param").id;
		const { password, username } = c.req.valid("json");
		await db.delete(authSessions).where(eq(authSessions.userId, id));
		if (password) {
			const hashedPassword = await saltAndHashPassword(password);
			const result = await db
				.update(users)
				.set({
					username: username,
					password: hashedPassword,
				})
				.where(eq(users.id, id))
				.returning({
					id: users.id,
				});
			if (result === undefined) {
				return errorResponse(c, {
					message: "User not found",
					type: "NOT_FOUND",
				});
			}
			return c.json(result[0], 200);
		}
		const result = await db
			.update(users)
			.set({
				username: username,
			})
			.where(eq(users.id, id))
			.returning({
				id: users.id,
			});
		if (result === undefined) {
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(result[0], 200);
	})

	.openapi(deleteUser, async (c) => {
		const id = c.req.valid("param").id;
		try {
			const deleteSessions = await db
				.delete(authSessions)
				.where(eq(authSessions.userId, id))
				.returning({
					id: authSessions.id,
				});

			const result = await db.delete(users).where(eq(users.id, id)).returning({
				id: users.id,
			});

			if (result.length > 0) {
				return c.json(result[0], 200);
			}
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		} catch (err) {
			return errorResponse(c, {
				message: (err as Error).message,
				type: "SERVER_ERROR",
			});
		}
	});

export default app;
