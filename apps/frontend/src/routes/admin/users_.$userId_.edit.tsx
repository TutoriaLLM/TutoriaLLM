import { AdminUserEditor } from "@/components/features/admin/userEditor/userEditor";
import { BackToPrevPage } from "@/components/features/editor/backPrev";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users_/$userId_/edit")({
	component: UserEditor,
	beforeLoad: ({ params }) => {
		return {
			userId: params.userId,
		};
	},
	loader: ({ context: { userId } }) => {
		return userId;
	},
});

function UserEditor() {
	const userId = Route.useLoaderData();
	return (
		<div>
			<BackToPrevPage />
			<AdminUserEditor id={userId} />
		</div>
	);
}
