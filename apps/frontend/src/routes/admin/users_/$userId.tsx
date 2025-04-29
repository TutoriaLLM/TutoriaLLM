import { getUserDetail } from "@/api/admin/users";
import { AdminUserInfo } from "@/components/features/admin/userEditor/userInfo";
import { BackToPrevPage } from "@/components/features/editor/backPrev";
import { authClient } from "@/libs/auth-client";
import type { SessionValue } from "@/type";
import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
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

const userQueryOptions = (userId: string) =>
	queryOptions({
		queryKey: ["users", userId],
		queryFn: () => getUserDetail({ id: userId }),
		staleTime: 1000 * 60 * 1, // 1 minute of cache
	});

export const Route = createFileRoute("/admin/users_/$userId")({
	component: UserViewer,
	beforeLoad: ({ params, context: { queryClient } }) => ({
		getUserDetail: async () => {
			const userDetail = await queryClient.ensureQueryData(
				userQueryOptions(params.userId),
			);
			return userDetail;
		},
	}),
	loader: async ({ context: { getUserDetail } }) => {
		return await getUserDetail();
	},
	onError: (e) => {
		console.error("Failed to load user detail", e);
		throw redirect({
			to: "/admin/users",
		});
	},
	validateSearch: zodValidator(sessionByUserQuerySchema),
	shouldReload: true,
});

function UserViewer() {
	const [currentUserId, setCurrentUserId] = useState<null | string>(null);
	useEffect(() => {
		authClient.getSession().then((session) => {
			setCurrentUserId(session.data?.user.id ?? null);
		});
	}, []);
	const userDetail = Route.useLoaderData();

	return (
		<div className="space-y-4">
			<BackToPrevPage
				breadCrumbs={[
					{ slug: "admin", label: "admin" },
					{ slug: "users", label: "users" },
					{
						slug: userDetail.id,
						// label: `${userDetail.username}(${userDetail.id})` || userDetail.id,
						label: userDetail.username
							? userDetail.username
							: `no username (${userDetail.id})`,
					},
				]}
			/>
			<AdminUserInfo currentUserId={currentUserId} />
		</div>
	);
}
