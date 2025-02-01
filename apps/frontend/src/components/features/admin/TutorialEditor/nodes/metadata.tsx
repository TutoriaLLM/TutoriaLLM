import { LangPicker } from "@/components/common/LangPicker.js";
import type { metadataNode } from "@/components/features/admin/TutorialEditor/nodes/nodeType";
import { Button } from "@/components/ui/button";
import { FancyMultiSelect } from "@/components/ui/tags";
import { useListTags } from "@/hooks/tutorials";
import {
	Handle,
	type NodeProps,
	NodeToolbar,
	Position,
	useReactFlow,
} from "@xyflow/react";
import i18next from "i18next";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type TagForInput = {
	value: string;
	label: string;
};

export function Metadata({ id, data }: NodeProps<metadataNode>) {
	const { updateNodeData, deleteElements } = useReactFlow();

	const { t } = useTranslation();
	const { tags: existingTags } = useListTags();

	const [inputValue, setInputValue] = useState<string>("");
	const [selectedTagsString, setSelectedTagsString] = useState<string>("");
	const [tags, setTags] = useState<TagForInput[]>([]);
	const [open, setOpen] = useState(false);
	//parse the loaded tags from data
	const [selected, setSelected] = useState<TagForInput[]>([]);

	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = (field: string, value: string) => {
		if (field === "tags") {
			// 前後のスペースを除去
			const trimmedValue = value.trim();

			if (trimmedValue === "") {
				// 空文字列なら空配列をセット
				updateNodeData(id, { ...data, [field]: [] });
			} else {
				// カンマ区切りで分割して、さらに空文字列を除去
				const tagsArray = trimmedValue
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag !== "");

				updateNodeData(id, { ...data, [field]: tagsArray });
			}
		} else {
			updateNodeData(id, { ...data, [field]: value });
		}
	};

	const handleDelete = () => {
		deleteElements({ nodes: [{ id: id }] });
	};

	//set current tags if they exist
	useEffect(() => {
		if (data.tags && data.tags.length > 0) {
			setSelected(
				data.tags.map((tag) => ({
					label: tag,
					value: tag,
				})),
			);
		}
	}, [data.tags]);

	//set existing tags for suggestions
	useEffect(() => {
		if (existingTags) {
			setTags(
				existingTags.map((tag) => ({
					label: tag.name,
					value: tag.name,
				})),
			);
		}
	}, [existingTags]);

	// UseEffect to update the tags when the input value changes
	useEffect(() => {
		if (selectedTagsString === "") {
			handleChange("tags", "");
		} else {
			handleChange("tags", selectedTagsString);
		}
	}, [selectedTagsString]);

	// Use useEffect to set the default language only once
	useEffect(() => {
		if (!data.language) {
			updateNodeData(id, { ...data, language: i18next.language });
		}
	}, [data.language, id, updateNodeData]);

	return (
		<div className="w-72 max-w-md bg-background rounded-2xl overflow-clip">
			<span className="w-full h-4 bg-border custom-drag-handle cursor-move flex justify-center items-center gap-2">
				<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
				<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
				<span className="text-xs w-1 h-1 rounded-full bg-accent-foreground" />
			</span>
			<NodeToolbar>
				<Button
					type="button"
					className="text-destructive-foreground"
					size="icon"
					variant="destructive"
					onClick={handleDelete}
				>
					<Trash2 className="drop-shadow" />
				</Button>
			</NodeToolbar>
			<div className="p-2">
				<div>{t("admin.metadata")}</div>
				<div style={{ marginTop: 5 }}>
					<label className="block mb-2">
						<span className="text-foreground">Title:</span>
						<input
							onChange={(evt) => handleChange("title", evt.target.value)}
							value={data.title || ""}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</label>
					<label className="block mb-2">
						<span className="text-foreground">Description:</span>
						<textarea
							onChange={(evt) => handleChange("description", evt.target.value)}
							value={data.description || ""}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</label>
					<div className="block mb-2 no-wheel">
						<span className="text-foreground">Tags:</span>
						<FancyMultiSelect
							inputRef={inputRef}
							inputValue={inputValue}
							setInputValue={setInputValue}
							setSelectedTagsString={setSelectedTagsString}
							selectedTagsString={selectedTagsString}
							tags={tags}
							setTags={setTags}
							selected={selected}
							setSelected={setSelected}
							open={open}
							setOpen={setOpen}
						/>
					</div>
					<div className="block mb-2">
						<span className="text-foreground">Language:</span>
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
