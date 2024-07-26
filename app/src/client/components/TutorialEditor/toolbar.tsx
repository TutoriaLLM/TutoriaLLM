import { $getSelection, $isRangeSelection, TextNode, $getRoot } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import type { HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createCodeNode } from "@lexical/code";
import { $createParagraphNode } from "lexical";
import { useRef } from "react";
import { Heading1, Heading2, Heading3, Pilcrow, Puzzle } from "lucide-react";
import type { SessionValue } from "../../../type";
import CodeInput from "../ui/Codeinput";
import * as Popover from "@radix-ui/react-popover";

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
	const inputRef = useRef<HTMLInputElement>(null);

	const formatHeading = (headingSize: HeadingTagType) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createHeadingNode(headingSize));
			} else {
				// No range selection, append at the end
				const root = $getRoot();
				const headingNode = $createHeadingNode(headingSize);
				headingNode.append(new TextNode("New heading"));
				root.append(headingNode);
			}
		});
	};

	const formatCodeBlock = (codeContent: string) => {
		editor.update(() => {
			console.log("formatCodeBlock", codeContent);
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const codeNode = $createCodeNode();
				$setBlocksType(selection, () => codeNode);
			} else {
				// No range selection, append at the end
				const root = $getRoot();
				const codeNode = $createCodeNode();
				const textNode = new TextNode(codeContent);
				codeNode.append(textNode);
				root.append(codeNode);
			}
		});
	};

	const formatParagraph = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createParagraphNode());
			} else {
				// No range selection, append at the end
				const root = $getRoot();
				const paragraphNode = $createParagraphNode();
				paragraphNode.append(new TextNode("New paragraph"));
				root.append(paragraphNode);
			}
		});
	};

	const fetchCodeData = async () => {
		if (inputRef.current) {
			try {
				const response = await fetch(`/api/session/${inputRef.current.value}`);
				if (!response.ok) {
					if (response.status === 404) {
						alert("Session not found");
					}
					inputRef.current.value = "";
				}
				const data: SessionValue = await response.json();
				const workspace = data.workspace;
				formatCodeBlock(
					`This is converted code of Blockly workspace: ${JSON.stringify(workspace, null, 2)}`,
				);
				inputRef.current.value = "";
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
				<Popover.Root>
					<Popover.Trigger asChild>
						<button className="text-gray-400" type="button">
							<Puzzle />
						</button>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							className="rounded-2xl z-[999] p-5  bg-white shadow-lg flex justify-center items-center"
							sideOffset={5}
						>
							<CodeInput onComplete={() => fetchCodeData()} ref={inputRef} />
							<Popover.PopoverClose />

							<Popover.Arrow className="fill-white" />
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			</div>
		</div>
	);
}
