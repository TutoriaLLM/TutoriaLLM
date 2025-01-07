import type * as Blockly from "blockly";
import { useTranslation } from "react-i18next";

import generateImageFromBlockName from "@/components/features/editor/generateImageFromBlockName";
import { getImageFromIndexedDB, saveImageToIndexedDB } from "@/indexedDB.js";
import { blockNameFromMenuState, highlightedBlockState } from "@/state.js";
import { useAtomValue } from "jotai";
import { Puzzle, ScanSearch, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";

function HighlightedBlockName({
	text,
	handleBlockNameClick,
}: {
	text: string;
	handleBlockNameClick: (blockName: string) => void;
}) {
	const [image, setImage] = useState<string | null>(null);
	const blockNameFromMenu = useAtomValue(blockNameFromMenuState);

	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null);

	// Calculate isHighlighted directly without useState and useEffect
	const isHighlighted = blockNameFromMenu === text;

	useEffect(() => {
		const fetchImage = async () => {
			// Check cache from IndexedDB
			const cachedImage = await getImageFromIndexedDB(`image_${text}`);
			if (cachedImage) {
				setImage(cachedImage);
			} else {
				const generatedImage = await generateImageFromBlockName(
					hiddenWorkspaceRef,
					hiddenDivRef,
					text,
				);
				setImage(generatedImage);
				// Stored in IndexedDB
				await saveImageToIndexedDB(`image_${text}`, generatedImage);
			}
		};
		fetchImage();

		// cleanup function
		return () => {
			if (hiddenDivRef.current) {
				try {
					hiddenDivRef.current.remove();
				} catch (error) {
					console.warn("Failed to remove hidden div", error);
				}
				hiddenDivRef.current = null;
			}
		};
	}, [text]);

	return (
		<span className="text-destructive h-full w-full flex justify-between relative animate-fade-in">
			{image && <img src={image} alt={text} className="max-h-32" />}
			<Button
				type="button"
				className={cn(
					"flex absolute bottom-2 backdrop-blur-lg right-2 gap-2 items-center transition-all text-white font-bold py-1 px-2 rounded-xl",
					{ "bg-destructive hover:bg-destructive/80": isHighlighted },
					{
						"bg-primary shadow-md shadow-primary/60 hover:bg-primary/80":
							!isHighlighted,
					},
				)}
				onClick={() => handleBlockNameClick(text)}
			>
				<span
					className={cn(
						"transition-transform p-1 px-2 duration-300 ease-in-out transform",
						{ "rotate-90": isHighlighted },
						{ "rotate-0": !isHighlighted },
					)}
				>
					{isHighlighted ? <X /> : <Puzzle />}
				</span>
			</Button>
		</span>
	);
}

function HighlightedBlockId({
	text,
	handleBlockIdClick,
}: {
	text: string;
	handleBlockIdClick: (blockName: string) => void;
}) {
	const { t } = useTranslation();

	const highlightedBlock = useAtomValue(highlightedBlockState);

	// Calculate isHighlighted directly without useState and useEffect
	const isHighlighted = highlightedBlock?.blockId === text;

	return (
		<span className="text-destructive h-full w-full text-wrap text-xs">
			<Button
				type="button"
				className={cn(
					"inline-flex items-center transition-all text-white font-bold py-1 px-2 rounded-xl",
					{ "bg-destructive hover:bg-destructive/80": isHighlighted },
					{
						"bg-primary shadow-md shadow-primary/60 hover:bg-primary/80":
							!isHighlighted,
					},
				)}
				onClick={() => handleBlockIdClick(text)}
				style={{ whiteSpace: "normal", wordWrap: "break-word" }}
			>
				<span
					className={`transition-transform p-0.5  gap-1 text-xs duration-300 ease-in-out transform ${
						isHighlighted ? "rotate-90" : "rotate-0"
					}`}
				>
					{isHighlighted ? <X /> : <ScanSearch />}
				</span>
				{t("textbubble.findBlock")}
			</Button>
		</span>
	);
}

export { HighlightedBlockName, HighlightedBlockId };
