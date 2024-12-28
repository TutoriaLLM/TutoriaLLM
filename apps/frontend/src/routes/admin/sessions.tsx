import {} from "@/api/admin/session.js";
import { SessionTable } from "@/components/features/admin/tables/sessions/table";
import {} from "@/components/ui/button";
import {} from "@/hooks/admin/session.js";
import type { SessionValue } from "@/type";
import {} from "@/utils/time";
import {} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {} from "@tanstack/react-table";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

import {} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export const sesisonQuerySchema = z.object({
	page: fallback(z.number(), 1).default(1),
	limit: fallback(z.number(), 10).default(10),
	sortField: fallback(
		z.string() as z.ZodType<keyof SessionValue>,
		"updatedAt",
	).default("updatedAt"),
	sortOrder: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
});

export const Route = createFileRoute("/admin/sessions")({
	component: Sessions, // This is the main
	validateSearch: zodValidator(sesisonQuerySchema),
	shouldReload: true,
});
function Sessions() {
	const [error, setError] = useState<string | null>(null);

	if (error) {
		alert(error);
		setError(null); // Reset error and continue display
	}

	return (
		<div>
			<SessionTable />
		</div>
	);
}
