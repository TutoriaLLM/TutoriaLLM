import { authClient } from "@/libs/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LanguageToStart } from "@/state.js";
import i18n from "i18next";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Login from "@/components/common/login";
import { LangPicker } from "@/components/common/Langpicker";
import { setLanguageState } from "@/utils/setdefaultLanguage";
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
	const { t } = useTranslation();
	const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);

	useEffect(() => {
		if (languageToStart === "") {
			setLanguageState(setLanguageToStart);
		}
	}, [languageToStart, setLanguageToStart]);

	useEffect(() => {
		i18n.changeLanguage(languageToStart);
	}, [languageToStart]);

	const redirect = search.redirect || "/";
	return (
		<div className="min-h-screen overflow-auto flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
			<div className="max-w-2xl w-full space-y-4 px-2">
				<div className="space-y-2 w-full items-center">
					<h2 className="text-3xl font-semibold">{t("login.title")}</h2>
					<p className="text-md font-medium text-gray-600">
						{t("login.welcome")}
					</p>
				</div>
				<Card>
					<CardContent className="p-6">
						<Login redirectTo={redirect} />
					</CardContent>
				</Card>
				<LangPicker
					language={languageToStart}
					setLanguage={setLanguageToStart}
				/>
			</div>
		</div>
	);
}
