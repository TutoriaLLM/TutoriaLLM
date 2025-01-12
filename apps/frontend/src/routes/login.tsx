import { authClient } from "@/libs/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import Login from "@/components/common/login";
import { LangPicker } from "@/components/common/Langpicker";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: async ({ search }) => {
		const session = await authClient.getSession();

		if (session.data) {
			const fallback = session.data.user.role === "admin" ? "/admin" : "/";
			const redirectTo = search.redirect || fallback;

			// Prevent redirects to /admin/login
			if (redirectTo === "/login") {
				throw redirect({ to: fallback });
			}

			throw redirect({ to: redirectTo });
		}
	},
	shouldReload: true,
	component: AdminLogin,
});
function AdminLogin() {
	const search = Route.useSearch();
	const { t, i18n } = useTranslation();

	const redirect = search.redirect || "/";
	return (
		<div className="min-h-screen overflow-auto flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-background">
			<div className="max-w-2xl w-full my-auto space-y-4 px-2">
				<div className="space-y-2 w-full text-center md:text-left">
					<h2 className="text-3xl font-semibold">{t("login.title")}</h2>
					<p className="text-md font-medium text-foreground">
						{t("login.welcome")}
					</p>
				</div>
				<Card>
					<CardContent className="p-6">
						<Login redirectTo={redirect} />
					</CardContent>
				</Card>
				<LangPicker
					language={i18n.language}
					setLanguage={i18n.changeLanguage}
				/>
			</div>
		</div>
	);
}
