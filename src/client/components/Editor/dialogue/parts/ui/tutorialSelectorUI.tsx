import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { currentSessionState } from "../../../../../state.js";
import type { Tutorial } from "../../../../../../server/db/schema.js";

type TutorialType = Pick<Tutorial, "id" | "metadata">;

function SelectTutorialUI() {
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

	// チュートリアルを選択し、セッションステートを上書き
	const [SessionState, setSessionState] = useAtom(currentSessionState);
	function selectTutorial(tutorial: TutorialType) {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
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
		});
	}

	return (
		<div className="gap-2 bg-white p-2 shadow rounded-2xl">
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
	);
}

export { SelectTutorialUI };
