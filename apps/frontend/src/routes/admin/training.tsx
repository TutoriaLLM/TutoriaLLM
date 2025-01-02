import type { adminClient } from "@/api";
import {
	createNewGuide,
	deleteGuide,
	deleteTrainingData,
	getRandomTrainingData,
	listGuides,
	searchGuides,
} from "@/api/admin/training";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { InferResponseType } from "backend/hc";
import {
	CalendarClock,
	CheckCircle2,
	Ellipsis,
	MessageCircleQuestion,
	Shuffle,
	Trash2,
	UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/training")({
	component: Training, // This is the main
});

function Training() {
	type TrainingData = InferResponseType<
		typeof adminClient.admin.training.data.random.$get,
		200
	>;
	type SearchResult = InferResponseType<
		typeof adminClient.admin.training.guide.search.$post,
		200
	>;
	type SearchResultAsList = InferResponseType<
		typeof adminClient.admin.training.guide.list.$get,
		200
	>; // embedding is not displayed.
	const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
	const [answer, setAnswer] = useState<string>("");
	const [searchText, setSearchText] = useState<string>("");
	const [searchResult, setSearchResult] = useState<
		SearchResult | SearchResultAsList | null
	>(null);

	const fetchTrainingData = () => {
		getRandomTrainingData().then((data) => {
			if (data?.question && data.answer) {
				setTrainingData(data);
				setAnswer(data.answer); // Set the initial answer
			} else {
				setTrainingData(null); // No valid data available
			}
		});
	};

	useEffect(() => {
		fetchTrainingData(); // Initial fetch
	}, []);

	const { mutate: postData } = useMutation({
		mutationFn: createNewGuide,
		onError: (error) => {
			console.error("Error updating training data:", error);
		},
	});

	const handleConfirm = () => {
		if (!trainingData) return;

		const updatedData = {
			...trainingData,
			metadata: {
				...trainingData.metadata,
				date: new Date().toISOString(), // Update the date

				// Update author if answer changes
				author:
					answer !== trainingData.answer
						? "AI, Edited by Admin"
						: trainingData.metadata.author,
			},
			answer,
		};
		// setTrainingData(null); // Clear the data after confirmation

		postData({
			...updatedData,
			id: updatedData.id.toString(),
		});

		// Fetch new data
		fetchTrainingData();
	};

	const { mutate: deleteData } = useMutation({
		mutationFn: deleteTrainingData,
		onSuccess: () => {
			setTrainingData(null); // Clear the data after deletion
		},
	});

	const { mutate: search } = useMutation({
		mutationFn: searchGuides,
		onSuccess: (data) => {
			if (data.length === 0) {
				return;
			}
			setSearchResult(data);
		},
		onError: (error) => {
			console.error("Error fetching search results:", error);
		},
	});

	const handleSearch = () => {
		if (!searchText) {
			// If search text is empty, get list of guides
			listGuides().then((result) => {
				setSearchResult(result);
			});
		}

		// Send search request to the API
		search({ query: searchText });
	};

	const { mutate: deleteGuideMutate } = useMutation({
		mutationFn: deleteGuide,
		onSuccess: () => {
			handleSearch();
		},
	});
	const renderSearchResults = () => {
		if (typeof searchResult === "string") {
			return <p>{searchResult}</p>;
		}
		if (Array.isArray(searchResult)) {
			return (
				<div className="max-w-6xl">
					{searchResult.map((result) => (
						<div
							key={result.id}
							className="border border-gray-400 rounded-2xl mb-2"
						>
							<div className="flex items-center gap-3">
								<span className="rounded-full bg-gray-200 p-3">
									<MessageCircleQuestion />
								</span>
								<h3 className="font-semibold text-lg py-2 px-1 rounded-full text-gray-800">
									#{result.id} {result.question}
								</h3>
							</div>
							<p className="text-gray-600">{result.answer}</p>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3 flex-wrap">
									<div className="flex items-center gap-2 text-gray-600">
										<Ellipsis />
										<span className="gap-0.5">
											<p className="text-xs text-gray-500">Session</p>
											<a href={`/${result.metadata?.sessionId}`}>
												{result.metadata?.sessionId}
											</a>
										</span>
									</div>{" "}
									<div className="flex items-center gap-2 text-gray-600">
										<UserRound />
										<span className="gap-0.5">
											<p className="text-xs text-gray-500">Author</p>
											<p> {result.metadata?.author}</p>
										</span>
									</div>
									<div className="flex items-center gap-2 text-gray-600">
										<CalendarClock />
										<span className="gap-0.5">
											<p className="text-xs text-gray-500">Date</p>
											<p>
												{" "}
												{new Date(
													result.metadata?.date as string,
												).toLocaleString()}
											</p>
										</span>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<button
										type="button"
										className="text-red-500"
										onClick={() =>
											deleteGuideMutate({ id: result.id.toString() })
										}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<div className="overflow-x-auto p-2 md:p-4">
			<div className="w-full h-full flex flex-col justify-center items-center gap-2">
				{trainingData ? (
					<div className="max-w-6xl bg-gray-300 rounded-2xl flex flex-col justify-between min-h-96 p-3 gap-3 w-full">
						<h2 className="text-2xl font-bold text-center p-3 border-b border-gray-400">
							Training data
						</h2>
						<div className="flex flex-col gap-2 p-2 grow rounded-2xl">
							<h3 className="text-xl font-semibold">Question</h3>
							<p className="text-lg">{trainingData.question}</p>
						</div>
						<div className="flex flex-col gap-2 p-2 grow rounded-2xl border-2 shadow">
							<h3 className="text-xl font-semibold">Answer</h3>
							<textarea
								className="text-lg rounded-xl p-2"
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
							/>
						</div>
						<div className="flex items-center justify-center w-full gap-2 p-2">
							<button
								className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-2xl"
								type="button"
								onClick={handleConfirm}
							>
								<CheckCircle2 />
							</button>
							<button
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-2xl"
								type="button"
								onClick={() => deleteData({ id: trainingData.id.toString() })}
							>
								<Trash2 />
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl"
								type="button"
								onClick={fetchTrainingData}
							>
								<Shuffle />
							</button>
						</div>
					</div>
				) : (
					<div className="max-w-6xl bg-gray-300 rounded-2xl flex flex-col justify-center items-center  min-h-96 p-3 gap-3 w-full">
						<p className="text-lg font-bold">利用できるデータがありません。</p>
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl mt-3"
							type="button"
							onClick={fetchTrainingData}
						>
							Shuffle
						</button>
					</div>
				)}

				<h2 className="text-xl font-semibold mt-2">Search knowledge</h2>

				<form
					className="mt-5"
					onSubmit={(e) => {
						e.preventDefault();
						handleSearch();
					}}
				>
					<input
						type="text"
						className="border p-2 rounded-2xl w-80"
						placeholder="Search any question..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
					<button
						className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-2xl ml-2"
						type="button"
						onClick={handleSearch}
					>
						Search
					</button>
				</form>
				<div className="mt-5">{renderSearchResults()}</div>
			</div>
		</div>
	);
}
