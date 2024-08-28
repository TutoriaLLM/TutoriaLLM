import { useAtom, useSetAtom } from "jotai";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { currentSessionState } from "../../../state.js";
import type { Tutorial } from "../../../../server/db/schema.js";
import { useTour } from "@reactour/tour";
import { set } from "zod";
import * as Switch from "@radix-ui/react-switch";

type TutorialType = Pick<Tutorial, "id" | "metadata">;

export default function OnBoarding() {
	const { t } = useTranslation();

	//選択可能なチュートリアルのリストを取得
	const [tutorials, setTutorials] = useState<TutorialType[]>([]);
	useEffect(() => {
		const fetchTutorials = async () => {
			try {
				const response = await fetch("api/tutorial");
				const data: Tutorial[] = await response.json();
				setTutorials(data);
			} catch (error) {
				console.error("Error fetching tutorials:", error);
			}
		};

		fetchTutorials();
	}, []);

	//チュートリアルを選択し、セッションステートを上書き
	const setSessionState = useSetAtom(currentSessionState);
	function selectTutorial(tutorial: TutorialType) {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
			if (prev) {
				return {
					...prev,
					tutorial: {
						isTutorial: true,
						tutorialId: tutorial.id,
						progress: 10, // チュートリアルの進行度を初期化
					},
					dialogue: [
						...prev.dialogue,
						{
							id: prev.dialogue.length + 1,
							contentType: "log",
							isuser: false,
							content: t("tutorial.startTutorial"),
						},
					],
				};
			}
			return prev;
		});
	}
	const { setIsOpen } = useTour();
	function toggleIsEasyMode() {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
			if (prev) {
				return {
					...prev,
					easyMode: !prev.easyMode,
				};
			}
			return prev;
		});
	}

	return (
		<div className="w-full flex flex-col gap-3 rounded-2xl bg-white drop-shadow-md text-gray-800 p-3">
			<div className="gap-2 bg-gray-100 p-2 rounded-2xl">
				<span>
					<h3 className="font-semibold text-lg">{t("tutorial.easyMode")}</h3>
					<p className="text-sm text-gray-600">
						{t("tutorial.easyModeDescription")}
					</p>
				</span>
				<Switch.Root
					className="w-10 h-6 md:w-16 md:h-10 rounded-2xl bg-gray-300 relative data-[state=checked]:bg-green-100"
					onCheckedChange={toggleIsEasyMode} // スイッチの状態変更時に実行する関数を設定
				>
					<Switch.Thumb className="shadow block w-4 h-4 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
				</Switch.Root>
			</div>

			<div className="gap-2 bg-gray-100 p-2 rounded-2xl">
				<span>
					<h3 className="font-semibold text-lg">{t("tutorial.tour")}</h3>
					<p className="text-sm text-gray-600">{t("tutorial.startTour")}</p>
				</span>
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="bg-sky-500 group text-white flex justify-center items-center text-sm max-w-sm rounded-2xl p-2 mt-2 hover:text-gray-200 gap-2 transition-all startTour"
				>
					<p>{t("tutorial.startTourButton")}</p>
					<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 transition" />
				</button>
			</div>
			<div className="tutorialSelector gap-2 bg-gray-100 p-2 rounded-2xl">
				<span>
					<h3 className="font-semibold text-lg">{t("tutorial.title")}</h3>
					<p className="text-sm text-gray-600">{t("tutorial.description")}</p>
				</span>
				<ul className="h-full flex flex-col gap-2 max-w-md">
					{tutorials.map((tutorial) => (
						<li
							key={tutorial.id}
							className="p-3 max-h-80 rounded-2xl bg-gray-200 shadow-sm w-full transition"
						>
							<span>
								<h4 className="font-semibold text-gray-800">
									{tutorial.metadata.title}
								</h4>
								<p className="text-sm text-gray-600">
									{tutorial.metadata.description}
								</p>
							</span>
							<button
								type="button"
								onClick={() => selectTutorial(tutorial)}
								className="bg-sky-500 group text-white flex justify-center items-center text-sm rounded-2xl p-2 mt-2 hover:text-gray-200 gap-2 transition-all"
							>
								<p className="border-r pr-1.5 border-sky-200">
									{t("tutorial.start")}
								</p>
								<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 transition" />
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
