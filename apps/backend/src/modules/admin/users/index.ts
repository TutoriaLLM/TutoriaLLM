import { createHonoApp } from "@/create-app";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateUserDetail, userDetailFromId } from "./routes";
import { errorResponse } from "@/libs/errors";

/**
 * These are manual APIs for admin to directly manage user information.
 * NOTE: Most of the user-related APIs are defined in Better-auth; the following ones
 *       can be used to handle advanced or manual operations that are not covered by Better-auth.
 */
const app = createHonoApp()
	/**
	 * Fetch a user's details by their ID
	 */
	.openapi(userDetailFromId, async (c) => {
		const userId = c.req.valid("param").id;
		const userDetail = await c.get("db").query.user.findFirst({
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
			// If no user found, respond with an error
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		}

		// Return the user's details
		return c.json(userDetail, 200);
	})
	/**
	 * Update a user's details manually, bypassing Better-auth
	 */
	.openapi(updateUserDetail, async (c) => {
		const userId = c.req.valid("param").id;
		const { name, email, image, role, username } = c.req.valid("json");

		const updatedUser = await c
			.get("db")
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

		if (!updatedUser || updatedUser.length === 0) {
			// If no user found to update, respond with an error
			return errorResponse(c, {
				message: "User not found",
				type: "NOT_FOUND",
			});
		}

		// Return the updated user's ID
		return c.json(updatedUser[0], 200);
	});

export default app;
