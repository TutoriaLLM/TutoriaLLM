import { useAtom } from "jotai";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Tutorial } from "../../../../type";
import { currentSessionState } from "../../../state";

type TutorialType = Pick<Tutorial, "id" | "metadata">;

export default function TutorialPicker() {
	const [tutorials, setTutorials] = useState<TutorialType[]>([]);

	useEffect(() => {
		const fetchTutorials = async () => {
			try {
				const response = await fetch("/tutorial");
				const data: Tutorial[] = await response.json();
				setTutorials(data);
			} catch (error) {
				console.error("Error fetching tutorials:", error);
			}
		};

		fetchTutorials();
	}, []);

	return (
		<div className="w-full flex flex-col gap-3 rounded-2xl bg-white drop-shadow-md text-gray-800 p-3">
			<span>
				<p className="text-sm text-gray-600">Let's start!</p>
				<h3 className="font-semibold text-lg">Pick your tutorial</h3>
			</span>
			<ul className="h-full flex flex-col gap-2 max-w-md">
				{tutorials.map((tutorial) => (
					<li
						key={tutorial.id}
						className="p-2 max-h-80 rounded-2xl bg-gray-200 shadow-sm flex justify-between w-full transition"
					>
						<span>
							<h4 className="font-medium">{tutorial.metadata.title}</h4>
							<p className="text-sm">{tutorial.metadata.description}</p>
						</span>
						<button
							type="button"
							className="bg-sky-500 text-white text-sm rounded-2xl p-2 hover:text-gray-200 -translate-x-0.5 hover:translate-x-0 transition-all"
						>
							Start this
							<ArrowRight />
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
