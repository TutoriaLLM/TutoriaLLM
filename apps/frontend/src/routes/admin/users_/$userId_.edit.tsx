import { getUserDetail } from "@/api/admin/users";
import { AdminUserEditor } from "@/components/features/admin/userEditor/userEditor";
import { BackToPrevPage } from "@/components/features/editor/backPrev";
import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

const userQueryOptions = (userId: string) =>
	queryOptions({
		queryKey: ["users", userId],
		queryFn: () => getUserDetail({ id: userId }),
		staleTime: 1000 * 60 * 1, // 1 minute of cache
	});

export const Route = createFileRoute("/admin/users_/$userId_/edit")({
	component: UserEditor,
	beforeLoad: ({ params, context: { queryClient } }) => ({
		getUserDetail: async () => {
			const userDetail = await queryClient.ensureQueryData(
				userQueryOptions(params.userId),
			);
			return userDetail;
		},
		userId: params.userId,
	}),

	loader: async ({ context: { userId, getUserDetail } }) => {
		const userDetail = await getUserDetail();
		return {
			userId,
			userDetail,
		};
	},
	onError: (e) => {
		console.error("Failed to load user detail", e);
		throw redirect({
			to: "/admin/users",
		});
	},
});

function UserEditor() {
	const { userId, userDetail } = Route.useLoaderData();

	return (
		<div className="space-y-4">
			<BackToPrevPage
				breadCrumbs={[
					{ slug: "admin", label: "admin" },
					{ slug: "users", label: "users" },

					{
						slug: userDetail.id,
						label: `${userDetail.username}(${userDetail.id})` || userDetail.id,
					},
					{
						slug: "edit",
						label: "edit",
					},
				]}
			/>
			<AdminUserEditor id={userId} detail={userDetail} />
		</div>
	);
}
