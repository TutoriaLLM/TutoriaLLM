import { getStatus } from "@/modules/health/routes";
import { createHonoApp } from "@/create-app";

const app = createHonoApp().openapi(getStatus, async (c) => {
	return c.json({ status: "ok" });
});

export default app;
