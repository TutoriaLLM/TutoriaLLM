import { AdminUserInfo } from "@/components/features/admin/userEditor/userInfo";
import { BackToPrevPage } from "@/components/features/editor/backPrev";
import type { SessionValue } from "@/type";
import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const sessionByUserQuerySchema = z.object({
	page: fallback(z.number(), 1).default(1),
	limit: fallback(z.number(), 10).default(10),
	sortField: fallback(
		z.string() as z.ZodType<keyof SessionValue>,
		"updatedAt",
	).default("updatedAt"),
	sortOrder: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
});

export const Route = createFileRoute("/admin/users_/$userId")({
	component: UserViewer,
	validateSearch: zodValidator(sessionByUserQuerySchema),
	shouldReload: true,
});

function UserViewer() {
	return (
		<div>
			<BackToPrevPage />
			<AdminUserInfo />
		</div>
	);
}
