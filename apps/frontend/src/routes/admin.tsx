import SideBar from "@/components/features/admin/Sidebar";
import { Toaster } from "@/components/ui/toaster";
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
		<div className="min-h-screen flex flex-col bg-gray-200 text-gray-800">
			<div className="w-full h-full max-w-[96rem]">
				<div className="h-full flex w-full">
					<SideBar />
					<div className="w-full h-full max-h-svh overflow-auto">
						<Outlet />
					</div>
					<Toaster />
				</div>
			</div>
		</div>
	);
}
