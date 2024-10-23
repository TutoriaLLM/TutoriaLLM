import React from "react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { currentSessionState } from "../../../../../state.js";
import * as Switch from "@radix-ui/react-switch";
import { Headphones, Text } from "lucide-react";
import { set } from "zod";

function SwitchModeUI(props: { audio: boolean | undefined }) {
	const { t } = useTranslation();
	const [SessionState, setSessionState] = useAtom(currentSessionState);

	function toggleIsEasyMode() {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
			return {
				...prev,
				easyMode: !prev.easyMode,
				dialogue: [
					...prev.dialogue,
					{
						id: prev.dialogue.length + 1,
						contentType: "log",
						isuser: false,
						content: t("tutorial.easyModeChanged", {
							status: !prev.easyMode ? t("on") : t("off"),
						}),
					},
				],
			};
		});
	}

	function toggleResponseMode() {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
			return {
				...prev,
				responseMode: prev.responseMode === "text" ? "audio" : "text",
				dialogue: [
					...prev.dialogue,
					{
						id: prev.dialogue.length + 1,
						contentType: "log",
						isuser: false,
						content: t("tutorial.responseModeChanged", {
							mode:
								prev.responseMode === "text"
									? t("generic.audio")
									: t("generic.text"),
						}),
					},
				],
			};
		});
	}

	return (
		<div className="w-full p-2 animate-fade-in">
			<div className="bg-white shadow w-full gap-2 sticky top-0 p-2 rounded-2xl flex flex-col ">
				<div className="flex justify-between items-center w-full">
					<span className="shrink">
						<h3 className="font-semibold text-lg">{t("tutorial.easyMode")}</h3>
						<p className="text-sm text-gray-600">
							{t("tutorial.easyModeDescription")}
						</p>
					</span>
					<Switch.Root
						className="w-14 h-8 md:w-16 md:h-10 shrink-0 rounded-2xl bg-gray-300 data-[state=checked]:bg-green-100"
						onCheckedChange={toggleIsEasyMode} // スイッチの状態変更時に実行する関数を設定
						checked={SessionState?.easyMode} // スイッチの状態を設定
					>
						<Switch.Thumb className="shadow block w-6 h-6 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
					</Switch.Root>
				</div>
				{props.audio && (
					<>
						<span className="w-full h-0.5 bg-gray-200" />
						<div className="flex justify-between items-center w-full">
							<span className="shrink">
								<h3 className="font-semibold text-lg">
									{t("tutorial.responseMode")}
								</h3>
								<p className="text-sm text-gray-600">
									{t("tutorial.responseModeDescription")}
								</p>
							</span>

							<Switch.Root
								className="w-16 h-8 md:w-20 md:h-10 shrink-0 relative rounded-2xl bg-gray-300 flex items-center"
								onCheckedChange={toggleResponseMode}
								checked={SessionState?.responseMode === "audio"}
							>
								{/* 左側のアイコン */}
								<div
									className={`absolute z-20 left-2 transition-opacity duration-200 ${
										SessionState?.responseMode === "audio"
											? "opacity-50 text-gray-500"
											: "opacity-100 text-sky-500"
									}`}
								>
									<Text className="md:w-6 md:h-6 w-4 h-4" />
								</div>

								{/*右側のアイコン */}
								<div
									className={`absolute z-20 right-2 transition-opacity duration-200 ${
										SessionState?.responseMode === "text"
											? "opacity-50 text-gray-500"
											: "opacity-100 text-sky-500"
									}`}
								>
									<Headphones className="md:w-6 md:h-6 w-4 h-4" />
								</div>

								<Switch.Thumb className="shadow z-10 block w-6 h-6 md:w-8 md:h-8 rounded-xl bg-white/60 transition-transform duration-300 transform translate-x-1 md:data-[state=checked]:translate-x-11 data-[state=checked]:translate-x-9" />
							</Switch.Root>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export { SwitchModeUI };
