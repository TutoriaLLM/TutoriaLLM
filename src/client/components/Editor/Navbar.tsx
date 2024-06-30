import { DoorOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import ExecSwitch from "../ExecSwitch";

export default function Navbar(props: { code: string; isConnected: boolean }) {
	const { t } = useTranslation();
	return (
		<div className="w-full p-4 bg-gray-200 border-b-2 border-gray-300 text-gray-800 z-50 flex justify-between gap-2">
			<a
				href="/"
				className="flex gap-0.5 bg-red-500 font-semibold hover:bg-red-300 transition-colors duration-150 border border-red-500 rounded-2xl p-4 text-white hover:text-gray-700"
			>
				<DoorOpen />
				<span>{t("navbar.leave")}</span>
			</a>
			<div className="flex flex-col justify-center items-center">
				<p className="font-semibold text-xl tracking-widest">{props.code}</p>
				<span className="text-xs flex">
					{props.isConnected ? (
						<p className="p-0.5 px-2 rounded-full bg-green-300">
							{t("navbar.connected")}
						</p>
					) : (
						<p className="p-0.5 px-2 rounded-full bg-red-300">
							{t("navbar.reconnecting")}
						</p>
					)}
				</span>
			</div>
			<ExecSwitch />
		</div>
	);
}
