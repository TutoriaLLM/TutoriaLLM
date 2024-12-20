import { getSpecificTutorial } from "@/api/admin/tutorials";
import type { SessionValue, Tutorial } from "@/type";
import { useEffect, useState } from "react";

//for admin
export default function SelectedTutorial(props: { session: SessionValue }) {
	const { session } = props;
	const tutorialId = session.tutorial.tutorialId;
	const [tutorial, setTutorial] = useState<null | Tutorial>(null);
	useEffect(() => {
		if (tutorialId) {
			getSpecificTutorial({ id: tutorialId }).then((response) => {
				setTutorial(response);
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
