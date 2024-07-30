import { DoorOpen, HomeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ExitButton } from "../ui/exitButton.js";

export default function Navbar() {
	const handleSignOut = async () => {
		console.log("signing out");
		const res = await fetch("/api/auth/logout", {
			method: "POST",
		});
		if (res.status === 200) {
			window.location.href = "/";
		}
	};

	const { t } = useTranslation();
	return (
		<div className="w-full p-2 md:p-4 bg-gray-200 border-b-2 border-gray-300 text-gray-800 z-50 flex justify-between gap-2">
			<div className="justify-items-center">
				<ExitButton text={t("navbar.signout")} onClick={handleSignOut} />
			</div>
		</div>
	);
}
