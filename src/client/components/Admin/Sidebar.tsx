import {
	Activity,
	Cog,
	GraduationCap,
	LayoutDashboard,
	Sidebar,
	User,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function SideBar() {
	const { t } = useTranslation();

	const [isOpen, setIsOpen] = useState(false);

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
	}) => (
		<Link
			to={href}
			className="hover:bg-gray-300 border flex gap-2 p-3 text-left py-3 rounded-2xl transition whitespace-nowrap"
		>
			<Icon />
			{label}
		</Link>
	);

	return (
		<div className=" flex">
			<div
				className={`bg-gray-200 text-gray-800 border-r-2 border-gray-300 h-full w-full p-2 transition-transform transform ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 fixed md:static z-50`}
			>
				<div className="flex flex-col gap-2 p-2 font-semibold">
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
			<button
				onClick={toggleSidebar}
				type="button"
				className="fixed bottom-4 left-4 md:hidden p-2 gap-0.5 font-semibold text-xs justify-center items-center flex z-50 bg-gray-100 hover:bg-gray-300 shadow transition rounded-full border-gray-300"
			>
				<Sidebar />
				<span>{t("sidebar.toggle")}</span>
			</button>
		</div>
	);
}
