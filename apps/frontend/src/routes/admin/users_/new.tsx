import { AdminUserCreator } from "@/components/features/admin/userEditor/userCreator";
import { BackToPrevPage } from "@/components/features/editor/backPrev";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users_/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-4">
			<BackToPrevPage
				breadCrumbs={[
					{ slug: "admin", label: "admin" },
					{ slug: "users", label: "users" },
					{
						slug: "new",
						label: "new",
					},
				]}
			/>
			<AdminUserCreator />
		</div>
	);
}
