import * as Progress from "@radix-ui/react-progress";
import { DoorOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import ExecSwitch from "../ExecSwitch";

export default function Navbar(props: {
	code: string;
	isConnected: boolean;
	isTutorial: boolean | null | undefined;
	tutorialProgress: number | null | undefined;
}) {
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
			<div className="flex justify-center items-center gap-2">
				<span className="text-xs">
					<p className="font-semibold text-xl tracking-widest">{props.code}</p>
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
				<span className="border border-gray-300 h-full" />
				<span className="text-xs">
					{props.isTutorial && typeof props.tutorialProgress === "number" ? (
						<p className="p-0.5 px-2">
							<Progress.Root
								max={100}
								value={props.tutorialProgress}
								className="rounded-full bg-gray-300 w-32 h-3 overflow-hidden"
							>
								<Progress.Indicator
									className="bg-green-300 rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
									style={{
										transform: `translateX(-${100 - props.tutorialProgress}%)`,
									}}
								/>
							</Progress.Root>
							{props.tutorialProgress}%
						</p>
					) : (
						<p className="p-0.5 px-2 rounded-full bg-red-300">
							{t("navbar.noTutorial")}
						</p>
					)}
				</span>
			</div>
			<ExecSwitch />
		</div>
	);
}
