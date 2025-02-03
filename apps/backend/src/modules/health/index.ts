import { getStatus } from "@/modules/health/routes";
import { createHonoApp } from "@/create-app";

/**
 * This controller handles the service health check endpoint.
 * It provides a simple way to verify that the service is up and running.
 */
const app = createHonoApp()
	/**
	 * Return basic service status.
	 */
	.openapi(getStatus, async (c) => {
		return c.json({ status: "ok" });
	});

export default app;
