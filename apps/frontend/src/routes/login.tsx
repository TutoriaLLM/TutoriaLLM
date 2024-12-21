import LoginPopup from "@/components/features/admin/loginOverlay";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: async ({ search }) => {
		const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;
		const response = await fetch(`${backendUrl}/credential`, {
			credentials: "include",
		});

		if (response.status === 200) {
			const fallback = "/admin";
			const redirectTo = search.redirect || fallback;

			// /admin/login へのリダイレクトを防ぐ
			if (redirectTo === "/login") {
				throw redirect({ to: fallback });
			}

			throw redirect({ to: redirectTo });
		}
	},
	component: AdminLogin,
});
function AdminLogin() {
	const search = Route.useSearch();

	const redirect = search.redirect || "/admin";
	return (
		<LoginPopup
			isPopupOpen={true}
			message="You need to login to access this page"
			redirectTo={redirect}
		/>
	);
}
