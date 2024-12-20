import SideBar from "@/components/Admin/Sidebar";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
	beforeLoad: async ({ location }) => {
		const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;
		const response = await fetch(`${backendUrl}/credential`, {
			credentials: "include",
		});
		if (response.status !== 200) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
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
					<div className="w-full h-full max-h-svh overflow-auto p-2 pt-16 md:p-4">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}
