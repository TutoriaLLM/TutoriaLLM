import { getTagList } from "@/api/tutorials.js";
import { LangPicker } from "@/components/common/Langpicker.js";
import type { metadataNode } from "@/components/features/admin/TutorialEditor/nodes/nodetype";
import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useReactFlow,
} from "@xyflow/react";
import i18next from "i18next";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { KEYS, WithContext as ReactTags } from "react-tag-input";

type Tag = {
	id: string;
	className: string;
	text?: string;
};

export function Metadata({ id, data }: NodeProps<metadataNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const [tags, setTags] = useState<Tag[]>(
		data.tags.map((tag) => ({
			id: tag,
			className: "",

			text: tag,
		})) || [],
	);
	const [suggestions, setSuggestions] = useState<Tag[]>([]);

	const handleChange = (field: string, value: string) => {
		if (field === "tags") {
			const tagsArray = value.split(",").map((tag) => tag.trim());
			setTags(tagsArray.map((tag) => ({ id: "", className: "", text: tag })));
			updateNodeData(id, { ...data, [field]: tagsArray });
		} else {
			updateNodeData(id, { ...data, [field]: value });
		}
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	const handleTagDelete = (index: number) => {
		const newTags = tags.filter((_, i) => i !== index);
		setTags(newTags);
		updateNodeData(id, { ...data, tags: newTags.map((tag) => tag.text) });
	};

	const handleTagAddition = (tag: Tag) => {
		if (!tags.some((existingTag) => existingTag.id === tag.id)) {
			const newTags = [...tags, tag];
			setTags(newTags);
			updateNodeData(id, { ...data, tags: newTags.map((tag) => tag.text) });
		}
	};

	const handleTagDrag = (tag: Tag, currPos: number, newPos: number) => {
		const newTags = tags.slice();
		newTags.splice(currPos, 1);
		newTags.splice(newPos, 0, tag);
		setTags(newTags);
		updateNodeData(id, { ...data, tags: newTags.map((tag) => tag.text) });
	};

	// Use useEffect to set the default language only once
	useEffect(() => {
		if (!data.language) {
			updateNodeData(id, { ...data, language: i18next.language });
		}
	}, [data.language, id, updateNodeData]);

	// Fetching tags from the API
	useEffect(() => {
		getTagList().then((result) => {
			const fetchedTags = result.map(
				(tag: { id: number | null; name: string }) => ({
					id: tag.id?.toString() || "", // Convert id to string
					className: "",
					text: tag.name, // Convert name to text
				}),
			);
			setSuggestions(fetchedTags);
		});
	}, []);

	return (
		<div className="w-72 max-w-md bg-gray-200 rounded-2xl overflow-clip">
			<span className="w-full h-4 bg-gray-300 custom-drag-handle cursor-move justify-center items-center flex gap-2">
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
				<span className="text-xs w-1 h-1 rounded-full bg-white" />
			</span>
			<NodeToolbar>
				<button type="button" className="text-red-500 " onClick={handleDelete}>
					<Trash2 className="drop-shadow" />
				</button>
			</NodeToolbar>
			<div className="p-2">
				<div>Metadata</div>
				<div style={{ marginTop: 5 }}>
					<label className="block mb-2">
						<span className="text-gray-700">Title:</span>
						<input
							onChange={(evt) => handleChange("title", evt.target.value)}
							value={data.title || ""}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</label>
					<label className="block mb-2">
						<span className="text-gray-700">Description:</span>
						<textarea
							onChange={(evt) => handleChange("description", evt.target.value)}
							value={data.description || ""}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</label>
					<div className="block mb-2">
						<span className="text-gray-700">Tags:</span>
						<ReactTags
							tags={tags}
							suggestions={suggestions}
							delimiters={[13, KEYS.COMMA]}
							handleDelete={handleTagDelete}
							handleAddition={handleTagAddition}
							handleDrag={handleTagDrag}
							classNames={{
								tags: "flex flex-col flex-wrap items-center rounded-2xl p-2 bg-gray-100",
								tagInput: "bg-white p-1 rounded-2xl w-full",
								tagInputField: "w-full border-none focus:ring-0",
								selected: "flex flex-wrap items-center mt-2",
								tag: "bg-blue-100 text-blue-700 rounded-md p-1 m-1",
								remove: "ml-2 cursor-pointer text-red-500",
								suggestions:
									"absolute bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10",
								activeSuggestion: "bg-blue-100",
								editTagInput: "border border-gray-300 rounded-md p-1",
								editTagInputField: "w-full border-none focus:ring-0",
								clearAll: "cursor-pointer text-red-500",
							}}
						/>
					</div>
					<div className="block mb-2">
						<span className="text-gray-700">Language:</span>
						<LangPicker
							language={data.language}
							setLanguage={(lang) => handleChange("language", lang)}
						/>
					</div>
				</div>
			</div>

			<Handle
				type="source"
				position={Position.Right}
				style={{ background: "blue", padding: 5, zIndex: 1000 }}
				isValidConnection={(connection) =>
					connection.targetHandle === "metadata"
				}
			/>
		</div>
	);
}
