import SideBar from "@/components/features/admin/Sidebar";
import { authClient } from "@/libs/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
	beforeLoad: async ({ location }) => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
		if (session.data.user.role !== "admin") {
			throw redirect({
				to: "/",
			});
		}
	},
});
function AdminPage() {
	return (
		<div className="min-h-svh flex flex-col bg-accent text-accent-foreground">
			<div className="h-full flex w-full flex-col md:flex-row">
				<SideBar />
				<div className="w-full h-full p-2 md:p-4 max-h-svh md:overflow-auto">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
