import { getTagList, getTutorialList } from "@/api/tutorials.js";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/libs/utils";
import { currentSessionState } from "@/state.js";
import type { Tutorial } from "@/type.js";
import { langToStr } from "@/utils/langToStr.js";

import { useSetAtom } from "jotai";
import { ArrowRight, BookDashed, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
	const [columns, setColumns] = useState(3); // Add column count states

	useEffect(() => {
		const fetchTutorials = async () => {
			try {
				const response = await getTutorialList();
				setTutorials(response);
			} catch (error) {
				console.error("Error fetching tutorials:", error);
			}
		};

		const fetchTags = async () => {
			try {
				const response = await getTagList();
				setTags(response);
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

	const setSessionState = useSetAtom(currentSessionState);

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
					...(prev.dialogue || []),
					{
						id: (prev.dialogue?.length ?? 0) + 1,
						contentType: "log",
						isuser: false,
						content: t("tutorial.startTutorial"),
					},
				],
			};
		});
		setIsTutorialSelectorOpen(false); // Close the popup
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
				selectedTags.every((tagName) =>
					tutorial.tags.some((tag) => tag.name === tagName),
				),
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
		<div className="rounded-2xl bg-gradient-to-r border from-sky-200 to-rose-200 p-3 shadow max-w-md flex justify-between items-center animate-fade-in">
			<span>
				<h3 className="font-semibold text-lg">{t("tutorial.title")}</h3>
				<p className="text-sm text-foreground">{t("tutorial.description")}</p>
			</span>
			<Dialog>
				<DialogTrigger>
					<Button
						type="button"
						variant="outline"
						onClick={switchTutorialSelector}
					>
						{t("generic.open")}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>{t("tutorial.title")}</DialogTitle>
					<DialogDescription>{t("tutorial.description")}</DialogDescription>
					<div className="flex flex-col gap-4 p-2 md:p-4 min-h-[70vh]">
						<span className="flex flex-col gap-2">
							<h3 className="font-bold text-3xl">{t("tutorial.title")}</h3>
							<p className="text-sm text-gray-600">
								{t("tutorial.description")}
							</p>
						</span>
						<span className="flex flex-wrap gap-2">
							{tags.map((tag) => (
								<Button
									key={tag.name}
									type="button"
									variant="outline"
									onClick={() => toggleTagSelection(tag.name)}
									className={cn({
										"border-primary text-primary bg-accent":
											selectedTags.includes(tag.name),
									})}
								>
									{tag.name}
								</Button>
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
									className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-between gap-3 bg-card border shadow-sm w-full col-span-1 transition group"
								>
									<span className="flex flex-col gap-2">
										<h4 className="font-semibold text-xl text-foreground">
											{tutorial.metadata.title}
										</h4>
										<p className="text-sm text-accent-foreground">
											{tutorial.metadata.description}
										</p>
										<span className="flex flex-wrap gap-1">
											{tutorial.tags.map((tag) => (
												<span
													key={tag.name}
													className="bg-accent text-xs flex text-accent-foreground px-2 py-1 rounded-2xl flex-wrap"
												>
													{tag.name}
												</span>
											))}
										</span>
									</span>
									<div className="flex justify-center items-center gap-3">
										<Button
											type="button"
											onClick={() => selectTutorial(tutorial)}
										>
											<p>{t("tutorial.start")}</p>
											<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 group-hover:animate-pulse transition" />
										</Button>
										<span className="text-sm text-foreground gap-2 shrink">
											<span className="text-foreground font-semibold flex gap-2 justify-center items-center">
												<EyeIcon />
												{tutorial.metadata.selectCount}
											</span>
											{langToStr(tutorial.language)}
										</span>
									</div>
								</li>
							))}
							{Array.from({ length: userLanguageSkeletons }).map((_, index) => (
								<li
									key={`skeleton-user-${index}`}
									className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-center items-center gap-3 shadow-inner w-full col-span-1 transition group"
								>
									<BookDashed className="w-12 h-12 text-gray-200" />
								</li>
							))}
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
									className="p-3 h-80 animate-fade-in rounded-2xl flex flex-col justify-between gap-3 bg-card border shadow-sm w-full col-span-1 transition group"
								>
									<span className="flex flex-col gap-2">
										<h4 className="font-semibold text-xl text-foreground">
											{tutorial.metadata.title}
										</h4>
										<p className="text-sm text-accent-foreground">
											{tutorial.metadata.description}
										</p>
										<span className="flex flex-wrap gap-1">
											{tutorial.tags.map((tag) => (
												<span
													key={tag.name}
													className="bg-accent text-xs flex text-accent-foreground px-2 py-1 rounded-2xl flex-wrap"
												>
													{tag.name}
												</span>
											))}
										</span>
									</span>
									<div className="flex justify-center items-center gap-3">
										<Button
											type="button"
											onClick={() => selectTutorial(tutorial)}
										>
											<p>{t("tutorial.start")}</p>
											<ArrowRight className="-translate-x-0.5 group-hover:translate-x-0 group-hover:animate-pulse transition" />
										</Button>
										<span className="text-sm text-foreground gap-2 shrink">
											<span className="text-foreground font-semibold flex gap-2 justify-center items-center">
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
										<BookDashed className="w-12 h-12 text-muted" />
									</li>
								),
							)}
						</ul>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export { SelectTutorialUI };
