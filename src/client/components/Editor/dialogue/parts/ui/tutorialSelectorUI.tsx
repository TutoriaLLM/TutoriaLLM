import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { ArrowRight, BookDashed, EyeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { currentSessionState } from "../../../../../state.js";
import type { Tutorial } from "../../../../../../server/db/schema.js";
import Popup from "../../../../ui/Popup.js";
import { langToStr } from "../../../../../../utils/langToStr.js";

// Define TutorialType
type TutorialType = Pick<Tutorial, "id" | "metadata" | "language" | "tags">;

type TagType = {
	name: string;
};

function SelectTutorialUI() {
	const { t, i18n } = useTranslation();
	const userLanguage = i18n.language;
	// Fetch available tutorials
	const [tutorials, setTutorials] = useState<TutorialType[]>([]);
	const [isTutorialSelectorOpen, setIsTutorialSelectorOpen] = useState(false);
	const [tags, setTags] = useState<TagType[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [columns, setColumns] = useState(3); // カラム数のステートを追加

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

		const fetchTags = async () => {
			try {
				const response = await fetch("api/tutorial/tags");
				const data: TagType[] = await response.json();
				setTags(data);
			} catch (error) {
				console.error("Error fetching tags:", error);
			}
		};

		fetchTutorials();
		fetchTags();
	}, []);

	useEffect(() => {
		const updateColumns = () => {
			if (window.innerWidth >= 768) {
				setColumns(3);
			} else if (window.innerWidth >= 640) {
				setColumns(2);
			} else {
				setColumns(1);
			}
		};

		window.addEventListener("resize", updateColumns);
		updateColumns();

		return () => window.removeEventListener("resize", updateColumns);
	}, []);

	const [SessionState, setSessionState] = useAtom(currentSessionState);

	// Select a tutorial and update session state
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
					progress: 10,
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
		setIsTutorialSelectorOpen(false); // ポップアップを閉じる
	}

	function switchTutorialSelector() {
		setIsTutorialSelectorOpen(!isTutorialSelectorOpen);
	}

	// Toggle tag selection for filtering
	function toggleTagSelection(tagName: string) {
		setSelectedTags((prevSelectedTags) =>
			prevSelectedTags.includes(tagName)
				? prevSelectedTags.filter((name) => name !== tagName)
				: [...prevSelectedTags, tagName],
		);
	}

	// Filter tutorials by selected tags
	const filteredTutorials = selectedTags.length
		? tutorials.filter((tutorial) =>
				selectedTags.every((tagName) => tutorial.tags.includes(tagName)),
			)
		: tutorials;

	const userLanguageTutorials = filteredTutorials.filter(
		(tutorial) => tutorial.language === userLanguage,
	);

	const otherLanguageTutorials = filteredTutorials.filter(
		(tutorial) => tutorial.language !== userLanguage,
	);

	// Calculate the number of skeleton items needed
	let userLanguageSkeletons =
		(columns - (userLanguageTutorials.length % columns)) % columns;
	let otherLanguageSkeletons =
		(columns - (otherLanguageTutorials.length % columns)) % columns;

	// Ensure the total number of items (tutorials + skeletons) is at least 3
	if (userLanguageTutorials.length + userLanguageSkeletons < 3) {
		userLanguageSkeletons = 3 - userLanguageTutorials.length;
	}
	if (otherLanguageTutorials.length + otherLanguageSkeletons < 3) {
		otherLanguageSkeletons = 3 - otherLanguageTutorials.length;
	}

	return (
		<div>
			{isTutorialSelectorOpen ? (
				<Popup
					openState={isTutorialSelectorOpen}
					onClose={switchTutorialSelector}
					Content={
						<div className="flex flex-col gap-4 p-2 md:p-4 min-h-[70vh]">
							<span className="flex flex-col gap-2">
								<h3 className="font-bold text-3xl">{t("tutorial.title")}</h3>
								<p className="text-sm text-gray-600">
									{t("tutorial.description")}
								</p>
							</span>
							<span className="flex flex-wrap gap-2">
								{tags.map((tag) => (
									<button
										key={tag.name}
										type="button"
										onClick={() => toggleTagSelection(tag.name)}
										className={`p-3 rounded-2xl text-sm transition-all ${
											selectedTags.includes(tag.name)
												? "bg-sky-500 text-white"
												: "bg-gray-300 text-gray-800"
										}`}
									>
										{tag.name}
									</button>
								))}
							</span>
							<ul
								className={
									"h-full w-full grid sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 md:p-3 flex-grow"
								}
							>
								{userLanguageTutorials.map((tutorial) => (
									<li
										key={tutorial.id}
										className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-between gap-3 bg-gray-200 shadow-sm w-full col-span-1 transition group"
									>
										<span className="flex flex-col gap-2">
											<h4 className="font-semibold text-xl text-gray-800">
												{tutorial.metadata.title}
											</h4>
											<p className="text-sm text-gray-600">
												{tutorial.metadata.description}
											</p>
											<span className="flex flex-wrap gap-1">
												{tutorial.tags.map((tag) => (
													<span
														key={tag}
														className="bg-gray-300 text-xs flex text-gray-800 px-2 py-1 rounded-2xl flex-wrap"
													>
														{tag}
													</span>
												))}
											</span>
										</span>
										<div className="flex justify-center items-center gap-3">
											<button
												type="button"
												onClick={() => selectTutorial(tutorial)}
												className="bg-sky-500 grow text-white flex justify-center items-center text-sm rounded-2xl p-2 mt-2 hover:text-gray-200 gap-2 transition-all"
											>
												<p className="border-r pr-1.5 border-sky-200">
													{t("tutorial.start")}
												</p>
												<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 group-hover:animate-pulse transition" />
											</button>
											<span className="text-sm text-gray-600 gap-2 shrink">
												<span className="text-gray-800 font-semibold flex gap-2 justify-center items-center">
													<EyeIcon />
													{tutorial.metadata.selectCount}
												</span>
												{langToStr(tutorial.language)}
											</span>
										</div>
									</li>
								))}
								{Array.from({ length: userLanguageSkeletons }).map(
									(_, index) => (
										<li
											key={`skeleton-user-${index}`}
											className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-center items-center gap-3 shadow-inner shadow-gray-300 w-full col-span-1 transition group"
										>
											<BookDashed className="w-12 h-12 text-gray-200" />
										</li>
									),
								)}
							</ul>
							<h4 className="font-semibold text-xl mt-3">
								{t("tutorial.otherLanguage")}
							</h4>
							<ul
								className={
									"h-full w-full grid sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 md:p-3 flex-grow"
								}
							>
								{otherLanguageTutorials.map((tutorial) => (
									<li
										key={tutorial.id}
										className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-between gap-3 bg-gray-200 shadow-sm w-full col-span-1 transition group"
									>
										<span className="flex flex-col gap-2">
											<h4 className="font-semibold text-xl text-gray-800">
												{tutorial.metadata.title}
											</h4>
											<p className="text-sm text-gray-600">
												{tutorial.metadata.description}
											</p>
											<span className="flex flex-wrap gap-1">
												{tutorial.tags.map((tag) => (
													<span
														key={tag}
														className="bg-gray-300 text-xs flex text-gray-800 px-2 py-1 rounded-2xl flex-wrap"
													>
														{tag}
													</span>
												))}
											</span>
										</span>
										<div className="flex justify-center items-center gap-3">
											<button
												type="button"
												onClick={() => selectTutorial(tutorial)}
												className="bg-sky-500 grow text-white flex justify-center items-center text-sm rounded-2xl p-2 mt-2 hover:text-gray-200 gap-2 transition-all"
											>
												<p className="border-r pr-1.5 border-sky-200">
													{t("tutorial.start")}
												</p>
												<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 group-hover:animate-pulse transition" />
											</button>
											<span className="text-sm text-gray-600 gap-2 shrink">
												<span className="text-gray-800 font-semibold flex gap-2 justify-center items-center">
													<EyeIcon />
													{tutorial.metadata.selectCount}
												</span>
												{langToStr(tutorial.language)}
											</span>
										</div>
									</li>
								))}
								{Array.from({ length: otherLanguageSkeletons }).map(
									(_, index) => (
										<li
											key={`skeleton-other-${index}`}
											className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-center items-center gap-3 shadow-inner shadow-gray-300 w-full col-span-1 transition group"
										>
											<BookDashed className="w-12 h-12 text-gray-200" />
										</li>
									),
								)}
							</ul>
						</div>
					}
				/>
			) : null}
			<div className="rounded-2xl bg-gradient-to-r from-sky-200 to-rose-200 p-3 shadow max-w-md flex justify-between items-center animate-fade-in">
				<span>
					<h3 className="font-semibold text-lg">{t("tutorial.title")}</h3>
					<p className="text-sm text-gray-600">{t("tutorial.description")}</p>
				</span>
				<button
					type="button"
					className="p-2 px-3 rounded-xl font-bold shadow whitespace-nowrap bg-gray-200 hover:bg-gray-300"
					onClick={switchTutorialSelector}
				>
					{t("generic.open")}
				</button>
			</div>
		</div>
	);
}

export { SelectTutorialUI };
