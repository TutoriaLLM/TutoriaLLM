import { deleteTutorial } from "@/api/admin/tutorials.js";
import { useListTutorials } from "@/hooks/admin/tutorials.js";
import type { Tutorial } from "@/type.js";
import { langToStr } from "@/utils/langToStr.js";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import TutorialEditor from "../../TutorialEditor/index.js";

export default function Tutorials() {
	// const [tutorials, setTutorials] = useState<Tutorial[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [uploadedJson, setUploadedJson] = useState<Tutorial | null>(null); // アップロードしたJSONを管理する状態

	const { tutorials, isPending } = useListTutorials();

	const { mutate: del } = useMutation({
		mutationFn: deleteTutorial,
		onSuccess: () => {
			alert("Tutorial deleted successfully");
		},
		onError: (error) => {
			setError(error.message);
			alert(`An error occurred: ${error}`);
		},
	});

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const json = JSON.parse(e.target?.result as string);
					const partialTutorial = parsePartialTutorial(json);
					setUploadedJson(partialTutorial as Tutorial); // JSONデータを状態にセット
				} catch (error) {
					alert("Falied to parse JSON. Please check the format and try again.");
				}
			};
			reader.readAsText(file);
		}

		function parsePartialTutorial(data: any): Partial<Tutorial> {
			const partialTutorial: Tutorial = {
				id: 0,
				content: "",
				tags: [],
				language: "",
				metadata: {
					title: "",
					description: "",
					selectCount: 0,
				},
				serializednodes: "",
			};
			if (typeof data === "object" && data !== null) {
				if (typeof data.id === "number") partialTutorial.id = data.id;
				if (typeof data.language === "string")
					partialTutorial.language = data.language;
				if (
					Array.isArray(data.tags) &&
					data.tags.every((tag: any) => typeof tag === "string")
				) {
					partialTutorial.tags = data.tags;
				}
				if (typeof data.metadata === "object" && data.metadata !== null) {
					partialTutorial.metadata = {
						title: "",
						description: "",
						selectCount: 0,
					};
					if (typeof data.metadata.title === "string")
						partialTutorial.metadata.title = data.metadata.title;
					if (typeof data.metadata.description === "string")
						partialTutorial.metadata.description = data.metadata.description;
					if (typeof data.metadata.selectCount === "number")
						partialTutorial.metadata.selectCount = data.metadata.selectCount;
				}
			}
			return partialTutorial;
		}
	};

	if (error) {
		alert(error);
		setError(null); // エラーをリセットして表示を続行
	}

	return (
		<div className="bg-gray-300 rounded-2xl overflow-clip">
			<div className="overflow-x-auto max-w-screen ">
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
								Language
							</th>
							<th scope="col" className="px-6 py-4">
								Tags
							</th>
							<th scope="col" className="px-6 py-4">
								Select Count
							</th>
							<th scope="col" className="px-6 py-4">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="gap-2">
						{isPending ? (
							<SkeletonRows />
						) : tutorials && tutorials.length > 0 ? (
							tutorials?.map((tutorial) => {
								const metadata = tutorial.metadata;
								return (
									<tr
										key={tutorial.id}
										className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
									>
										<td className="px-6 py-4 max-w-md truncate">
											{metadata.title}
										</td>
										<td className="px-6 py-4 max-w-md truncate">
											{metadata.description}
										</td>
										<td className="px-6 py-4 max-w-md truncate">
											{langToStr(tutorial.language)}
										</td>
										<td className="px-6 py-4 max-w-md truncate">
											{tutorial.tags.join(", ")}
										</td>
										<td className="px-6 py-4 max-w-md truncate">
											{metadata.selectCount}
										</td>
										<td className="px-6 py-4 border-l-2 flex gap-2 border-gray-300 items-center justify-center w-full">
											<div className="min-w-16">
												<TutorialEditor id={tutorial.id} buttonText="Edit" />
											</div>

											<button
												type="button"
												className="p-2 w-full min-w-16 h-full rounded-full bg-red-500 font-semibold text-white hover:bg-red-600"
												onClick={() => del({ id: tutorial.id })}
											>
												Delete
											</button>
										</td>
									</tr>
								);
							})
						) : (
							<tr
								key={0}
								className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
							>
								<td
									colSpan={6}
									className="w-full text-xl font-semibold text-center py-4 h-60"
								>
									No Tutorials on this server...
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="p-2 border-b-2 border-gray-300 bg-gray-300 flex flex-col items-center gap-2 w-full">
				<h2 className="font-semibold">Create New Tutorial</h2>
				<TutorialEditor id={null} buttonText="New Tutorial" />

				<h2 className="font-semibold">Import Tutorial</h2>
				<div className="flex gap-2">
					<input
						type="file"
						accept=".json"
						onChange={handleFileUpload}
						className="flex rounded-2xl border-2 border-gray-400 p-2"
					/>
					{uploadedJson && (
						<TutorialEditor
							id={null}
							buttonText="Import Tutorial"
							json={uploadedJson}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

const SkeletonRows = () => {
	return Array.from({ length: 3 }).map((_, index) => (
		<tr
			key={`skeleton-${index}`}
			className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
		>
			<td className="px-6 py-4">
				<div className="h-4  rounded animate-loading-flow bg-gradient-to-r from-gray-300 from-30% via-gray-200 via-50% to-gray-300 to-70% bg-[size:280%] bg-center" />
			</td>
			<td className="px-6 py-4 w-full">
				<div className="h-4  rounded animate-loading-flow bg-gradient-to-r from-gray-300 from-30% via-gray-200 via-50% to-gray-300 to-70% bg-[size:280%] bg-center" />
			</td>
			<td className="px-6 py-4 w-full">
				<div className="h-4  rounded animate-loading-flow bg-gradient-to-r from-gray-300 from-30% via-gray-200 via-50% to-gray-300 to-70% bg-[size:280%] bg-center" />
			</td>
			<td className="px-6 py-4">
				<div className="h-4  rounded animate-loading-flow bg-gradient-to-r from-gray-300 from-30% via-gray-200 via-50% to-gray-300 to-70% bg-[size:280%] bg-center" />
			</td>

			<td className="px-6 py-4 border-l-2 flex gap-2 border-gray-300 items-center justify-center w-full">
				<div className="min-w-16">
					<div className="h-8 rounded animate-loading-flow bg-gradient-to-r from-gray-300 from-30% via-gray-200 via-50% to-gray-300 to-70% bg-[size:280%] bg-center" />
				</div>
				<div className="min-w-16">
					<div className="h-8 rounded animate-loading-flow bg-gradient-to-r from-gray-300 from-30% via-gray-200 via-50% to-gray-300 to-70% bg-[size:280%] bg-center" />
				</div>
			</td>
		</tr>
	));
};
