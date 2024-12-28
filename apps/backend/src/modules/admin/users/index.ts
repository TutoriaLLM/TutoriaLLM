import { createHonoApp } from "@/create-app";
import { findUserIdFromStr } from "./routes";
import { db } from "@/db";
import { user } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const app = createHonoApp().openapi(findUserIdFromStr, async (c) => {
	const str = c.req.valid("param").string;
	const isEmail = z.string().email().safeParse(str).success;
	const userIds = isEmail
		? await db
				.select({
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
				})
				.from(user)
				.where(eq(user.email, str))
		: await db
				.select({
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
				})
				.from(user)
				.where(eq(user.username, str));
	return c.json(userIds[0], 200);
});

export default app;
