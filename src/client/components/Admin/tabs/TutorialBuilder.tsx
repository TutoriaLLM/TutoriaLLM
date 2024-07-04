import * as Label from "@radix-ui/react-label";
import React from "react";
import SlideEditor from "../../SlideEditor";

export default function TutorialBuilder() {
	return (
		<div className="w-full h-full flex flex-col gap-4 p-3">
			<div className="flex flex-col gap-2">
				<span>
					<h2 className="font-semibold text-2xl text-gray-800">
						Metadata Editor
					</h2>
					<p className="text-sm text-gray-600">
						Edit the metadata of the tutorial.
					</p>
				</span>{" "}
				<div className="flex flex-wrap items-center gap-4 px-5">
					<Label.Root
						className="text-gray-800 border-l-2 border-blue-500 pl-3"
						htmlFor="firstName"
					>
						<h3 className="font-semibold text-base">Title</h3>
						<p className="font-medium text-xs">Title of the tutorial</p>
					</Label.Root>
					<input
						className="p-1.5 rounded-2xl bg-white"
						type="text"
						id="firstName"
						defaultValue="Pedro Duarte"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-4 px-5">
					<Label.Root
						className="text-gray-800 border-l-2 border-blue-500 pl-3"
						htmlFor="firstName"
					>
						<h3 className="font-semibold text-base">Description</h3>
						<p className="font-medium text-xs">
							Brief description of the turorial
						</p>
					</Label.Root>
					<input
						className="p-1.5 rounded-2xl bg-white"
						type="text"
						id="firstName"
						defaultValue="Pedro Duarte"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-4 px-5">
					<Label.Root
						className="text-gray-800 border-l-2 border-blue-500 pl-3"
						htmlFor="firstName"
					>
						<h3 className="font-semibold text-base">keywords</h3>
						<p className="font-medium text-xs">Separated by comma</p>
					</Label.Root>
					<input
						className="p-1.5 rounded-2xl bg-white"
						type="text"
						id="firstName"
						defaultValue="Pedro Duarte"
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
				<SlideEditor />
			</div>
		</div>
	);
}
