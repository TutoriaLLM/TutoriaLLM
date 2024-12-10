import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ExitButton } from "../ui/exitButton.js";
import {
	Activity,
	Bot,
	Cog,
	GraduationCap,
	LayoutDashboard,
	Sidebar,
	User,
} from "lucide-react";

export default function SideBar(props: { path: string[] }) {
	const { t } = useTranslation();
	const location = useLocation();

	const [isOpen, setIsOpen] = useState(false);
	const path = props.path;
	const [currentSegment, setCurrentSegment] = useState(path[path.length - 1]);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		const newPath = location.pathname.split("/");
		setCurrentSegment(newPath[newPath.length - 1]);
	}, [location]);

	const SidebarItem = ({
		href,
		icon: Icon,
		label,
	}: {
		href: string;
		icon: React.FC;
		label: string;
	}) => {
		const linkList = href.split("/");
		return (
			<Link
				to={href}
				className={`hover:bg-gray-300 border flex gap-2 p-3 text-left py-3 rounded-2xl transition whitespace-nowrap ${
					currentSegment === linkList[linkList.length - 1] ? "bg-gray-300" : ""
				}`}
				onClick={() => {
					setIsOpen(false);
					setCurrentSegment(linkList[linkList.length - 1]);
				}}
			>
				<Icon />
				{label}
			</Link>
		);
	};

	const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;

	const handleSignOut = async () => {
		console.log("signing out");
		const res = await fetch(`${backendUrl}/logout`, {
			method: "POST",
			credentials: "include",
		});
		if (res.status === 200) {
			window.location.href = "/";
		}
	};

	return (
		<div className="flex flex-col">
			<div className="z-[60]">
				<button
					onClick={toggleSidebar}
					type="button"
					className="md:hidden p-2 fixed top-2 left-2 gap-0.5 font-semibold text-xs justify-center items-center flex bg-gray-100 hover:bg-gray-300 shadow transition rounded-full border-gray-300"
				>
					<Sidebar />
					<span>{t("sidebar.toggle")}</span>
				</button>
			</div>
			<div
				className={`bg-gray-200 text-gray-800 border-r-2 border-gray-300 h-full w-full p-2 transition-transform transform ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 fixed md:static z-50`}
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
