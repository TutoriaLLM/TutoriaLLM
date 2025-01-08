import { TutorialsTable } from "@/components/features/admin/tables/tutorials/table";
import { AdminFooterWrapper } from "@/components/layout/adminFooter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast";
import type { Tutorial } from "@/type.js";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const tutorialsQuerySchema = z.object({
	page: fallback(z.number(), 1).default(1),
	limit: fallback(z.number(), 10).default(10),
	sortField: fallback(z.string() as z.ZodType<keyof Tutorial>, "id").default(
		"id",
	),
	sortOrder: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
});

export const Route = createFileRoute("/admin/tutorials")({
	component: Tutorials, // This is the main
	shouldReload: true,
	validateSearch: zodValidator(tutorialsQuerySchema),
});

function Tutorials() {
	const { t } = useTranslation();
	const { toast } = useToast();
	// const [tutorials, setTutorials] = useState<Tutorial[]>([]);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();

	if (error) {
		toast({
			description: t("toast.anErrorOccurred") + error,
		});

		setError(null); // Reset error and continue display
	}

	return (
		<div className="overflow-clip">
			<div className="overflow-x-auto max-w-screen space-y-2">
				<TutorialsTable />
				<AdminFooterWrapper>
					<h2 className="font-semibold">{t("admin.createTutorial")}</h2>
					<Button
						onClick={() =>
							router.navigate({
								to: "/admin/tutorials/new",
							})
						}
					>
						{t("admin.createTutorial")}
					</Button>
				</AdminFooterWrapper>
			</div>
		</div>
	);
}
