import { useState, useEffect, useRef } from "react";
import type * as Blockly from "blockly";
import type { TFunction } from "i18next";
import { MenuSquare, Puzzle, X } from "lucide-react";
import { workspaceToPngBase64 } from "../../../../ui/workspaceToPng.js";
import Theme from "../../../Blockly/theme/index.js";
import "../../../../../styles/blockly.css";
import generateImageFromBlockName from "../../../generateImageFromBlockName.js";

function renderBlockNameBubble(
	content: string,
	t: TFunction,
	blockNameFromMenu: string | null,
	handleBlockNameClick: (blockName: string) => void,
	id: number,
) {
	const [base64, setBase64] = useState<string>("");
	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null); // divを参照するためのref

	useEffect(() => {
		generateImageFromBlockName(hiddenWorkspaceRef, hiddenDivRef, content).then(
			(base64) => {
				setBase64(base64);
			},
		);
		if (hiddenDivRef.current) {
			try {
				hiddenDivRef.current.remove();
			} catch (error) {
				console.warn("Failed to remove hidden div", error);
			}
			hiddenDivRef.current = null;
		}
	}, [content]);

	const isHighlighted = blockNameFromMenu === content;

	return (
		<div key={id} className="flex justify-start items-end gap-2">
			<div className="text-gray-600 flex flex-col items-center">
				<span className="bg-gray-200 rounded-full p-2">
					<Puzzle />
				</span>
				<p className="text-xs">{t("textbubble.block")}</p>
			</div>
			<div className="text-gray-800 bg-gray-200 rounded-2xl p-3 max-w-sm w-full justify-between">
				{base64 && (
					<img
						src={base64}
						alt="block"
						className="flex w-full h-full max-w-48"
					/>
				)}
				<span className="w-full justify-between flex">
					<button
						type="button"
						className={`flex gap-2 items-center transition-all ${
							isHighlighted
								? "bg-red-500 hover:bg-red-600"
								: "bg-orange-500 shadow-md shadow-red-500 hover:bg-orange-600"
						} text-white font-bold py-2 px-4 rounded-2xl`}
						onClick={() => handleBlockNameClick(content)}
					>
						<span
							className={`transition-transform duration-300 ease-in-out transform ${
								isHighlighted ? "rotate-90" : "rotate-0"
							}`}
						>
							{isHighlighted ? <X /> : <MenuSquare />}
						</span>
						<span>
							<p>{t("textbubble.findBlockFromMenu")}</p>
						</span>
					</button>
				</span>
			</div>
		</div>
	);
}

export { renderBlockNameBubble };
