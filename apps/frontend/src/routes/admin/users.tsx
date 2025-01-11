import { UserTable } from "@/components/features/admin/tables/users/table";
import { AdminFooterWrapper } from "@/components/layout/adminFooter";
import { Button } from "@/components/ui/button";
import { authClient } from "@/libs/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const userQuerySchema = z.object({
	page: fallback(z.number(), 1).default(1),
	limit: fallback(z.number(), 10).default(10),
	sortField: fallback(z.string(), "id").default("id"),
	sortOrder: fallback(z.enum(["asc", "desc"]), "asc").default("asc"),
	searchField: z.enum(["name", "email"]).optional(),
	searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
	searchValue: z.string().optional(),
	role: z.string().optional(),
});

export const Route = createFileRoute("/admin/users")({
	component: Users, // This is the main
	validateSearch: zodValidator(userQuerySchema),
	shouldReload: true,
});

function Users() {
	const { t } = useTranslation();
	const router = useRouter();
	const [currentUserId, setCurrentUserId] = useState<null | string>(null);
	useEffect(() => {
		authClient.getSession().then((session) => {
			setCurrentUserId(session.data?.user.id ?? null);
		});
	}, []);

	return (
		<div className="overflow-x-auto space-y-2">
			<UserTable userId={currentUserId ?? ""} />
			<AdminFooterWrapper>
				<h2 className="font-semibold">{t("admin.createUser")}</h2>
				<Button
					onClick={() =>
						router.navigate({
							to: "/admin/users/new",
						})
					}
				>
					{t("admin.createUser")}
				</Button>
			</AdminFooterWrapper>
		</div>
	);
}
