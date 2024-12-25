import { authClient } from "@/libs/auth-client";
import * as Dialog from "@radix-ui/react-dialog";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LanguageToStart } from "@/state.js";
import i18n from "i18next";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Login from "@/components/common/login";
import { LangPicker } from "@/components/common/Langpicker";
import Overlay from "@/components/ui/Overlay";
import { setLanguageState } from "@/utils/setdefaultLanguage";

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
		<Overlay
			openState={true}
			Content={
				<div className="fixed flex flex-col justify-center items-center max-w-md w-full gap-3 bg-transparent p-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] font-semibold">
					<div className="w-full flex flex-col justify-center items-center p-2 gap-2">
						<Dialog.Title className="text-3xl">{t("login.title")}</Dialog.Title>
						<Dialog.Description className="text-md font-medium text-gray-600">
							{t("login.welcome")}
						</Dialog.Description>
					</div>
					<div className=" bg-white rounded-3xl shadow p-3 w-full">
						<Login redirectTo={redirect} />
					</div>
					<LangPicker
						language={languageToStart}
						setLanguage={setLanguageToStart}
					/>
				</div>
			}
		/>
	);
}
