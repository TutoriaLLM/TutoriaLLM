import React from "react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { currentSessionState } from "../../../../../state.js";
import * as Switch from "@radix-ui/react-switch";

function SwitchModeUI() {
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

	return (
		<div className="w-full p-2 animate-fade-in">
			<div className="bg-white shadow w-full gap-2 sticky top-0 p-2 rounded-2xl flex justify-between items-center">
				<span className="shrink">
					<h3 className="font-semibold text-lg">{t("tutorial.easyMode")}</h3>
					<p className="text-sm text-gray-600">
						{t("tutorial.easyModeDescription")}
					</p>
				</span>
				<Switch.Root
					className="w-10 h-6 md:w-16 md:h-10 shrink-0 rounded-2xl bg-gray-300 data-[state=checked]:bg-green-100"
					onCheckedChange={toggleIsEasyMode} // スイッチの状態変更時に実行する関数を設定
					checked={SessionState?.easyMode} // スイッチの状態を設定
				>
					<Switch.Thumb className="shadow block w-4 h-4 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform md:data-[state=checked]:translate-x-7 data-[state=checked]:translate-x-5 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
				</Switch.Root>
			</div>
		</div>
	);
}

export { SwitchModeUI };
