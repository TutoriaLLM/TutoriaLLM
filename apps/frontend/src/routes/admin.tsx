import SideBar from "@/components/Admin/Sidebar";
import LoginPopup from "@/components/loginOverlay/index";
import { LanguageToStart } from "@/state";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import i18next from "i18next";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
});
function AdminPage() {
	const languageToStart = useAtomValue(LanguageToStart);
	const [showPopup, setShowPopup] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language") || languageToStart;
		i18next.changeLanguage(storedLanguage);
		console.log("languageToStart", storedLanguage);
	}, [languageToStart]);

	useEffect(() => {
		async function fetchAuthInfo() {
			const response = await fetch(`${backendUrl}/credential`, {
				credentials: "include",
			});
			if (response.status === 200) {
				const authInfo = await response.body;
				console.log("authInfo", authInfo);
				setIsAuthenticated(true);
				setShowPopup(false);
			} else {
				console.log("auth failed");
				setIsAuthenticated(false);
				setShowPopup(true);
			}
		}
		fetchAuthInfo();
	}, []);

	useEffect(() => {
		localStorage.setItem("language", languageToStart);
		i18next.changeLanguage(languageToStart);
	}, [languageToStart]);

	return (
		<div className="min-h-screen flex flex-col bg-gray-200 text-gray-800">
			{isAuthenticated ? (
				<div className="w-full h-full max-w-[96rem]">
					<div className="h-full flex w-full">
						<SideBar />
						<div className="w-full h-full max-h-svh overflow-auto p-2 pt-16 md:p-4">
							<Outlet />
						</div>
					</div>
				</div>
			) : (
				<LoginPopup
					langToStart={languageToStart}
					isPopupOpen={showPopup}
					message="You need to login to access this page"
				/>
			)}
		</div>
	);
}
