import yaml from "js-yaml";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import TutorialEditor from "../../TutorialEditor/index.js";
import type { Tutorial } from "../../../../server/db/schema.js";

export default function Tutorials() {
	const [tutorials, setTutorials] = useState<Tutorial[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTutorials = () => {
		fetch("/api/admin/tutorials")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response was not ok ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				setTutorials(data);
				setLoading(false);
			})
			.catch((error) => {
				setError(error.message);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchTutorials();
	}, []);

	const handleDeleteTutorial = (id: number) => {
		fetch(`/api/admin/tutorials/${id}`, {
			method: "DELETE",
		})
			.then((response) => {
				console.log(response);
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				setTutorials((prevTutorial) =>
					prevTutorial.filter((tutorial) => tutorial.id !== id),
				);
			})
			.catch((error) => {
				setError(error.message);
			});
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		alert(error);
		setError(null); // エラーをリセットして表示を続行
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-left text-sm whitespace-nowrap">
				<thead className="font-semibold border-b-2 border-gray-300">
					<tr>
						<th scope="col" className="px-6 py-4">
							Title
						</th>
						<th scope="col" className="px-6 py-4">
							Description
						</th>
						<th scope="col" className="px-6 py-4">
							Keywords
						</th>
						<th scope="col" className="px-6 py-4" />
					</tr>
				</thead>
				<tbody className="gap-2">
					{tutorials.map((tutorial) => {
						const metadata = tutorial.metadata;
						return (
							<tr
								key={tutorial.id}
								className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
							>
								<th className="px-6 py-4">{metadata.title}</th>
								<th className="px-6 py-4">{metadata.description}</th>
								<th className="px-6 py-4">{metadata.keywords}</th>
								<td className="px-6 py-4 border-l-2 flex gap-2 border-gray-300">
									<TutorialEditor id={tutorial.id} buttonText="Edit" />

									<button
										type="button"
										className="p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600"
										onClick={() => handleDeleteTutorial(tutorial.id)}
									>
										Delete
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			<div className="p-2 border-b-2 border-gray-300 bg-gray-300">
				<h2 className="py-2 font-semibold">Create New Tutorial</h2>
				<TutorialEditor id={null} buttonText="New Tutorial" />
			</div>
		</div>
	);
}
