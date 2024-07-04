import { $getSelection, $isRangeSelection } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import type { HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const SupportedBlockType = {
	paragraph: "Paragraph",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	h4: "Heading 4",
	h5: "Heading 5",
	h6: "Heading 6",
} as const;
type BlockType = keyof typeof SupportedBlockType;

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();

	const formatHeading = (headingSize: HeadingTagType) => {
		// エディタの状態を変更するために、editor.update()を使用する
		editor.update(() => {
			// editorから選択範囲を取得
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				// 選択範囲をheadingSizeに変更する
				$setBlocksType(selection, () => $createHeadingNode(headingSize));
			}
		});
	};

	return (
		<div className="flex space-x-4 px-4 py-2 border-b border-gray-300">
			<button
				className="text-gray-400"
				type="button"
				role="checkbox"
				aria-checked="false"
				onClick={() => formatHeading("h1")}
			>
				H1
			</button>
			<button
				className="text-gray-400"
				type="button"
				role="checkbox"
				aria-checked="false"
				onClick={() => formatHeading("h2")}
			>
				H2
			</button>
			<button
				className="text-gray-400"
				type="button"
				role="checkbox"
				aria-checked="false"
				onClick={() => formatHeading("h3")}
			>
				H3
			</button>
		</div>
	);
}
