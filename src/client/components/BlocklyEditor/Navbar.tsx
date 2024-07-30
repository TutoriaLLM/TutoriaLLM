import * as Progress from "@radix-ui/react-progress";
import { DoorOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import ExecSwitch from "../ExecSwitch.js";
import { ExitButton } from "../ui/exitButton.js";

export default function Navbar(props: {
	code: string;
	isConnected: boolean;
	isTutorial: boolean;
	tutorialProgress: number | null | undefined;
}) {
	const { t } = useTranslation();
	return (
		<div className="w-full p-2 md:p-4 bg-gray-200 border-b-2 border-gray-300 text-gray-800 z-50 flex justify-between gap-2">
			<ExitButton
				text={t("navbar.leave")}
				onClick={() => {
					location.href = "/";
				}}
			/>
			<div className="flex justify-center items-center gap-2">
				<span className="text-xs">
					<p>{t("navbar.joinCode")}</p>
					<p className="font-semibold text-xl tracking-widest">{props.code}</p>
					{props.isConnected ? null : (
						<p className="p-0.5 px-2 rounded-full bg-red-300 flex flex-nowrap">
							{t("navbar.reconnecting")}
						</p>
					)}
				</span>
				<span className="border border-gray-300 h-full" />
				<span className="text-xs flex">
					{props.isTutorial && typeof props.tutorialProgress === "number" ? (
						<p className="p-0.5 px-2">
							<Progress.Root
								max={100}
								value={props.tutorialProgress}
								className="rounded-full bg-gray-300 w-32 h-3 overflow-hidden"
							>
								<Progress.Indicator
									className="bg-green-400 rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
									style={{
										transform: `translateX(-${100 - props.tutorialProgress}%)`,
									}}
								/>
							</Progress.Root>
							<p className="text-base">{props.tutorialProgress}%</p>
						</p>
					) : (
						<p className="p-0.5 px-2 rounded-full bg-red-300 w-full line-clamp-2">
							{t("navbar.noTutorial")}
						</p>
					)}
				</span>
			</div>
			<ExecSwitch />
		</div>
	);
}
