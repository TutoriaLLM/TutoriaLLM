import { ExitButton } from "@/components/common/exitButton.js";
import { Button } from "@/components/ui/button";
import { authClient } from "@/libs/auth-client";
import { cn } from "@/libs/utils";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
	Activity,
	Bot,
	Cog,
	GraduationCap,
	LayoutDashboard,
	Sidebar,
	User,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SideBar() {
	const { t } = useTranslation();
	const location = useLocation().pathname;
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(true);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const SidebarItem = ({
		href,
		icon: Icon,
		label,
	}: {
		href: string;
		icon: React.FC;
		label: string;
	}) => {
		return (
			<Link
				to={href}
				className={cn(
					"hover:bg-accent flex gap-2 p-3 text-left py-3 rounded-2xl transition whitespace-nowrap",
					{ "bg-accent": location === href },
				)}
				onClick={() => {
					setIsOpen(false);
				}}
			>
				<Icon />
				{label}
			</Link>
		);
	};

	const handleSignOut = async () => {
		const result = await authClient.signOut();
		if (result.error) {
			console.error(result.error);
			alert("Error signing out");
			return;
		}
		router.history.push("/login");
	};

	return (
		<div className="flex flex-col">
			<div className="z-[60]">
				<Button
					onClick={toggleSidebar}
					type="button"
					className="md:hidden p-2 fixed top-2 left-2 gap-0.5 font-semibold text-xs justify-center items-center flex bg-background hover:bg-accent shadow transition rounded-full text-foreground"
				>
					<Sidebar />
					<span>{t("sidebar.toggle")}</span>
				</Button>
			</div>
			<div
				className={cn(
					"bg-background text-foreground border-r-2 border h-full w-full p-2 transition-transform transform md:translate-x-0 fixed md:static z-50",
					{ "translate-x-0": isOpen, "-translate-x-full": !isOpen },
				)}
			>
				<div className="flex flex-col gap-2 p-2 pt-16 md:p-2 font-semibold">
					<ExitButton text={t("navbar.signout")} onClick={handleSignOut} />
					<SidebarItem
						href="/admin"
						icon={LayoutDashboard}
						label={t("sidebar.dashboard")}
					/>

					<SidebarItem
						href="/admin/tutorials"
						icon={GraduationCap}
						label={t("sidebar.tutorials")}
					/>

					<SidebarItem
						href="/admin/sessions"
						icon={Activity}
						label={t("sidebar.sessions")}
					/>
					<SidebarItem
						href="/admin/training"
						icon={Bot}
						label={t("sidebar.trainingForAI")}
					/>

					<span className="w-full border-t-2 border-gray-300 text-gray-500" />
					<SidebarItem
						href="/admin/users"
						icon={User}
						label={t("sidebar.users")}
					/>

					<span className="w-full border-t-2 border-gray-300 text-gray-500" />
					<SidebarItem
						href="/admin/settings"
						icon={Cog}
						label={t("sidebar.settings")}
					/>
				</div>
			</div>
		</div>
	);
}
