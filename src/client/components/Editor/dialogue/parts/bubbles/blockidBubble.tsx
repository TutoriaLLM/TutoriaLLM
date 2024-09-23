import type { TFunction } from "i18next";
import { Puzzle, ScanSearch, X } from "lucide-react";
import type { HighlightedBlock } from "../../../../../../type.js";

function renderBlockIdBubble(
	content: string,
	t: TFunction,
	highlightedBlock: HighlightedBlock | null,
	handleHighlightClick: (blockId: string) => void,
	id: number,
) {
	const isHighlighted = highlightedBlock?.blockId === content;
	return (
		<div key={id} className="flex justify-start items-end gap-2">
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Puzzle />
				</span>
				<p className="text-xs">{t("textbubble.block")}</p>
			</div>
			<div className="text-gray-800 bg-transparent rounded-2xl p-3 max-w-sm w-full">
				<button
					type="button"
					className={`flex gap-2 items-center transition-colors ${
						isHighlighted
							? "bg-red-500 hover:bg-red-600"
							: "bg-orange-500 hover:bg-orange-600"
					} text-white font-bold py-2 px-4 rounded-full`}
					onClick={() => handleHighlightClick(content)}
				>
					<span
						className={`transition-transform duration-300 ease-in-out transform ${
							isHighlighted ? "rotate-90" : "rotate-0"
						}`}
					>
						{isHighlighted ? <X /> : <ScanSearch />}
					</span>
					{t("textbubble.findBlock")}
				</button>
			</div>
		</div>
	);
}

export { renderBlockIdBubble };
