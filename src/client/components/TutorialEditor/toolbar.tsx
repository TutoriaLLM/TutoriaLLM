import { $getSelection, $isRangeSelection, TextNode } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import type { HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createCodeNode } from "@lexical/code";
import { $createParagraphNode } from "lexical";
import { useState } from "react";
import { Heading1, Heading2, Heading3, Pilcrow, Puzzle } from "lucide-react";
import type { SessionValue } from "../../../type";

const SupportedBlockType = {
	paragraph: "Paragraph",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	h4: "Heading 4",
	h5: "Heading 5",
	h6: "Heading 6",
	code: "Code Block",
} as const;
type BlockType = keyof typeof SupportedBlockType;

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const [inputValue, setInputValue] = useState("");

	const formatHeading = (headingSize: HeadingTagType) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createHeadingNode(headingSize));
			}
		});
	};

	const formatCodeBlock = (codeContent: string) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const codeNode = $createCodeNode();
				const textNode = new TextNode(codeContent);
				codeNode.append(textNode);
				$setBlocksType(selection, () => codeNode);
			}
		});
	};

	const formatParagraph = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createParagraphNode());
			}
		});
	};

	const fetchCodeData = async () => {
		if (inputValue) {
			try {
				const response = await fetch(`/session/${inputValue}`);
				const data: SessionValue = await response.json();
				const workspace = data.workspace;
				formatCodeBlock(
					`This is converted code of Blockly workspace: ${JSON.stringify(workspace, null, 2)}`,
				);
				setInputValue("");
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
	};

	return (
		<div className="flex justify-between items-center x-4 py-2 border-b border-gray-300">
			<div className="flex space-x-4 ">
				<button
					className="text-gray-400"
					type="button"
					role="checkbox"
					aria-checked="false"
					onClick={() => formatHeading("h1")}
				>
					<Heading1 />
				</button>
				<button
					className="text-gray-400"
					type="button"
					role="checkbox"
					aria-checked="false"
					onClick={() => formatHeading("h2")}
				>
					<Heading2 />
				</button>
				<button
					className="text-gray-400"
					type="button"
					role="checkbox"
					aria-checked="false"
					onClick={() => formatHeading("h3")}
				>
					<Heading3 />
				</button>

				<button
					className="text-gray-400"
					type="button"
					role="checkbox"
					aria-checked="false"
					onClick={formatParagraph}
				>
					<Pilcrow />
				</button>
			</div>
			<div className="flex space-x-4 ">
				<input
					type="number"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="input p-2 border rounded-2xl"
					placeholder="Enter code number"
				/>
				<button
					className="text-gray-400"
					type="button"
					role="button"
					onClick={fetchCodeData}
				>
					<Puzzle />
				</button>
			</div>
		</div>
	);
}
