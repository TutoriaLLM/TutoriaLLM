import { createHonoApp } from "@/create-app";
import { errorResponse } from "@/libs/errors";
import appConfigRoute from "@/modules/admin/config";
import sessionManagerRoute from "@/modules/admin/session";
import trainingManagerRoute from "@/modules/admin/training";
import tutorialsManagerRoute from "@/modules/admin/tutorials";
import userRoute from "@/modules/admin/users";

// API entry point used by the admin page
const app = createHonoApp()
	// Disable access to the administrator page if you do not have authorization
	.use("/admin/*", async (c, next) => {
		if (!c.get("user")) {
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

	// // API to manage users
	.route("/", userRoute)

	// API to manage AI training data
	.route("/", trainingManagerRoute);

export type AdminAppType = typeof app;
export default app;
