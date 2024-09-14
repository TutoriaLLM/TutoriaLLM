import * as Label from "@radix-ui/react-label";
import React, { useState, useEffect } from "react";
import MdEditor from "./mdEditor.js";
import Popup from "../Popup.js";
import { removeFrontMatter } from "../../../utils/markdown.js";
import type { Tutorial } from "../../../server/db/schema.js";

type TutorialType = Pick<Tutorial, "metadata" | "content">;

export default function llTutorialEditor(props: {
	id: number | null;
	buttonText: string;
}) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

	const [tutorialData, setTutorialData] = useState<TutorialType>({
		metadata: {
			title: "",
			description: "",
			keywords: [],
		},
		content: "",
	});

	const handleOpenPopup = () => {
		if (props.id !== null) {
			setIsLoading(true); // データ取得開始時にローディングを開始
			fetch(`/api/admin/tutorials/${props.id}`)
				.then((response) => response.json() as Promise<Tutorial>)
				.then((data) => {
					console.log(data);
					const content = removeFrontMatter(data.content);
					setTutorialData({ metadata: data.metadata, content: content });
					setIsLoading(false); // データ取得完了後にローディングを終了
					setIsPopupOpen(true);
				})
				.catch((error) => {
					console.error("Error fetching tutorial data:", error);
					setIsLoading(false); // エラー時もローディングを終了
				});
		} else {
			setIsPopupOpen(true);
		}
	};

	const handleClosePopup = () => {
		setIsPopupOpen(false);
	};

	const handleInputChange = (
		field: keyof Tutorial["metadata"],
		value: string | string[],
	) => {
		setTutorialData((prevData) => ({
			...prevData,
			metadata: { ...prevData.metadata, [field]: value },
		}));
	};

	const handleContentChange = (content: string) => {
		setTutorialData((prevData) => ({
			...prevData,
			content,
		}));
	};

	const handleSave = () => {
		const url =
			props.id === null
				? "/api/admin/tutorials/new"
				: `/api/admin/tutorials/${props.id}`;
		const method = props.id === null ? "POST" : "PUT";

		//mdのフロントマターを作成して結合
		const content = `
---
title: ${tutorialData.metadata.title}
description: ${tutorialData.metadata.description}
keywords: ${tutorialData.metadata.keywords}
---
		${tutorialData.content}
		
		`;

		fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content: content,
				metadata: tutorialData.metadata,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.text();
			})
			.then((data) => {
				console.log(data);
				alert("Tutorial saved successfully!");
				handleClosePopup();
			})
			.catch((error) => {
				console.error("Error saving tutorial:", error);
				alert("Failed to save tutorial");
			});
	};

	const popupContent = (
		<div className="w-full h-full flex flex-col gap-4 p-3">
			<div className="flex flex-col gap-2">
				<span>
					<h2 className="font-semibold text-2xl text-gray-800">
						Metadata Editor
					</h2>
					<p className="text-sm text-gray-600">
						Edit the metadata of the tutorial.
					</p>
				</span>
				<div className="flex items-center gap-4 px-5">
					<Label.Root
						className="text-gray-800 border-l-2 border-blue-500 pl-3"
						htmlFor="title"
					>
						<h3 className="font-semibold text-base">Title</h3>
						<p className="font-medium text-xs">Title of the tutorial</p>
					</Label.Root>
					<input
						className="p-2 w-full border rounded-2xl bg-white"
						type="text"
						id="title"
						value={tutorialData.metadata.title}
						onChange={(e) => handleInputChange("title", e.target.value)}
					/>
				</div>
				<div className="flex items-center gap-4 px-5">
					<Label.Root
						className="text-gray-800 border-l-2 border-blue-500 pl-3"
						htmlFor="description"
					>
						<h3 className="font-semibold text-base">Description</h3>
						<p className="font-medium text-xs">
							Brief description of the tutorial
						</p>
					</Label.Root>
					<input
						className="p-2 w-full border rounded-2xl bg-white"
						type="text"
						id="description"
						value={tutorialData.metadata.description}
						onChange={(e) => handleInputChange("description", e.target.value)}
					/>
				</div>
				<div className="flex items-center gap-4 px-5">
					<Label.Root
						className="text-gray-800 border-l-2 border-blue-500 pl-3"
						htmlFor="keywords"
					>
						<h3 className="font-semibold text-base">Keywords</h3>
						<p className="font-medium text-xs">Separated by comma</p>
					</Label.Root>
					<input
						className="p-2 w-full border rounded-2xl bg-white"
						type="text"
						id="keywords"
						value={tutorialData.metadata.keywords}
						onChange={(e) =>
							handleInputChange(
								"keywords",
								e.target.value.split(",").map((k) => k.trim()),
							)
						}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span>
					<h2 className="font-semibold text-2xl text-gray-800">
						Tutorial Generator
					</h2>
					<p className="text-sm text-gray-600">
						Generate Tutorial Template from metadata.
					</p>
				</span>
				<span>
					<button
						type="button"
						className="rounded-2xl bg-blue-500 p-2 text-white font-semibold"
					>
						Generate
					</button>
				</span>
			</div>
			<div className="flex flex-col gap-2">
				<span>
					<h2 className="font-semibold text-2xl text-gray-800">
						Tutorial Editor
					</h2>
					<p className="text-sm text-gray-600">
						Edit the tutorial content after generation.
					</p>
				</span>
				<MdEditor
					mdContent={tutorialData.content}
					onContentChange={handleContentChange}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<span>
					<button
						type="button"
						className="rounded-2xl bg-blue-500 p-2 text-white font-semibold"
						onClick={() => handleSave()}
					>
						Save
					</button>
				</span>
			</div>
		</div>
	);

	return (
		<>
			<button
				type="button"
				className="rounded-2xl max-w-60 w-full bg-blue-500 p-2 text-white font-semibold"
				onClick={handleOpenPopup}
			>
				{props.buttonText}
			</button>
			{isLoading && <div>Loading...</div>} {/* ローディング中の表示 */}
			<Popup
				openState={isPopupOpen}
				onClose={handleClosePopup}
				Content={popupContent}
			/>
		</>
	);
}
