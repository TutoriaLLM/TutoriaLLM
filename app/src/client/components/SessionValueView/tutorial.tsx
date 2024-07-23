import { Clock, History } from "lucide-react";
import { msToTime, timeAgo } from "../../../utils/time";
import type { SessionValue } from "../../../type";
import { useEffect, useState } from "react";
import type { Tutorial } from "../../../server/db/schema";

export default function SelectedTutorial(props: { session: SessionValue }) {
	const { session } = props;
	const tutorialId = session.tutorial.tutorialId;
	const [tutorial, setTutorial] = useState<null | Tutorial>(null);
	useEffect(() => {
		if (tutorialId) {
			fetch(`/api/tutorial/${tutorialId}`)
				.then(async (response) => {
					if (!response.ok) {
						throw new Error(
							`Network response was not ok ${response.statusText}`,
						);
					}

					setTutorial(await response.json());
				})
				.catch((error) => {
					setTutorial(null);
				});
		}
	}, [tutorialId]);
	return (
		<div className="bg-gray-100 rounded-2xl p-2 gap-2 w-full font-medium">
			<h2 className="text-lg font-semibold">Selected Tutorial</h2>
			<div className="text-sm">
				Tutorial ID: {tutorial?.id ? tutorial.id : "not selected"}
			</div>
			<div className="text-sm">
				Tutorial Name:{" "}
				{tutorial?.metadata.title ? tutorial.metadata.title : "not selected"}
			</div>
		</div>
	);
}
