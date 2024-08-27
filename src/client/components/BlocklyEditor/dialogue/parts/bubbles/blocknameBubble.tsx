import type { TFunction } from "i18next";
import { MenuSquare, Puzzle, X } from "lucide-react";

function renderBlockNameBubble(
	content: string,
	t: TFunction,
	blockNameFromMenu: string | null,
	handleBlockNameClick: (blockName: string) => void,
	id: number,
) {
	const isHighlighted = blockNameFromMenu === content;
	return (
		<div key={id} className="flex justify-start items-end gap-2">
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Puzzle />
				</span>
				<p className="text-xs">{t("textbubble.block")}</p>
			</div>
			<div className="text-gray-800 bg-transparent rounded-2xl p-3 max-w-sm w/full">
				<img src="https://via.placeholder.com/150" alt="block" />

				<button
					type="button"
					className={`flex gap-2 items-center transition-colors ${
						isHighlighted
							? "bg-red-500 hover:bg-red-600"
							: "bg-orange-500 hover:bg-orange-600"
					} text-white font-bold py-2 px-4 rounded-full`}
					onClick={() => handleBlockNameClick(content)}
				>
					<span
						className={`transition-transform duration-300 ease-in-out transform ${
							isHighlighted ? "rotate-90" : "rotate-0"
						}`}
					>
						{isHighlighted ? <X /> : <MenuSquare />}
					</span>
					{t("textbubble.findBlockFromMenu")}
				</button>
			</div>
		</div>
	);
}

export { renderBlockNameBubble };
