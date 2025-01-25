import { createHonoApp } from "@/create-app";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateUserDetail, userDetailFromId } from "./routes";
import { errorResponse } from "@/libs/errors";

//NOTE: most of APIs were defined in Better-auth, these are manual APIs for admin to update user's information
const app = createHonoApp()
	.openapi(userDetailFromId, async (c) => {
		const userId = c.req.valid("param").id;
		const userDetail = await db.query.user.findFirst({
			where: eq(user.id, userId),
			columns: {
				id: true,
				name: true,
				email: true,
				image: true,
				createdAt: true,
				updatedAt: true,
				role: true,
				username: true,
				isAnonymous: true,
			},
		});
		if (!userDetail) {
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(userDetail, 200);
	})
	//API for directly push the updated user's information to the database (not defined in Better-auth yet)
	.openapi(updateUserDetail, async (c) => {
		const userId = c.req.valid("param").id;
		const { name, email, image, role, username } = c.req.valid("json");
		const updatedUser = await db
			.update(user)
			.set({
				name,
				email,
				image,
				role,
				username,
			})
			.where(eq(user.id, userId))
			.returning({
				id: user.id,
			});
		if (!updatedUser) {
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		}
		return c.json(updatedUser[0], 200);
	});

export default app;
