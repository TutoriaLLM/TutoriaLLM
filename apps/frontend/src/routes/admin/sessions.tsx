import { SessionTable } from "@/components/features/admin/tables/sessions/table";
import { useToast } from "@/hooks/toast";
import type { SessionValue } from "@/type";
import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
	const { toast } = useToast();
	const { t } = useTranslation();

	if (error) {
		toast({
			description: t("toast.anErrorOccurred") + error,
		});

		setError(null); // Reset error and continue display
	}

	return <SessionTable />;
}
