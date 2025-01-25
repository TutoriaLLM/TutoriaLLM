import { createHonoApp } from "@/create-app";
import { auth } from "@/libs/auth";
import { errorResponse } from "@/libs/errors";
import appConfigRoute from "@/modules/admin/config";
import sessionManagerRoute from "@/modules/admin/session";
import trainingManagerRoute from "@/modules/admin/training";
import tutorialsManagerRoute from "@/modules/admin/tutorials";
import userManagerRoute from "@/modules/admin/users";

// API entry point used by the admin page
const app = createHonoApp()
	// Disable access to the administrator page if you do not have authorization
	.use("/admin/**", async (c, next) => {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});
		if (!session || session.user.role !== "admin") {
			return errorResponse(c, {
				message: "Unauthorized",
				type: "UNAUTHORIZED",
			});
		}
		await next();
	})
	// API to configure the entire app Config.
	.route("/", appConfigRoute)

	// // Get more information about the session from DBrouter
	.route("/", sessionManagerRoute)

	// // API to manipulate the DB in the tutorial guide
	.route("/", tutorialsManagerRoute)

	// API to manage AI training data
	.route("/", trainingManagerRoute)

	// API to extend better-auth's features manually
	.route("/", userManagerRoute);
export type AdminAppType = typeof app;
export default app;
