import { useTranslation } from "react-i18next";
import type { Components } from "react-markdown";

import * as Blockly from "blockly";

import { useAtom, useSetAtom } from "jotai";
import {
	blockNameFromMenuState,
	currentTabState,
	highlightedBlockState,
} from "../../../../state.js";
import type { TFunction } from "i18next";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getExternalBlocks } from "../../Blockly/blocks/index.js";
import { listAllBlocks } from "../../../../../utils/blockList.js";
import generateImageFromBlockName from "../../generateImageFromBlockName.js";
import {
	getImageFromIndexedDB,
	saveImageToIndexedDB,
} from "../../../../indexedDB.js";
import { Puzzle, ScanSearch, X } from "lucide-react";
import type { SessionValue } from "../../../../../type.js";

function HighlightedBlockName({
	text,
	handleBlockNameClick,
}: {
	text: string;
	handleBlockNameClick: (blockName: string) => void;
}) {
	const { t } = useTranslation();
	const [image, setImage] = useState<string | null>(null);
	const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
		blockNameFromMenuState,
	);

	const hiddenWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const hiddenDivRef = useRef<HTMLDivElement | null>(null);

	// useStateとuseEffectを使わずに、直接isHighlightedを計算する
	const isHighlighted = blockNameFromMenu === text;

	if (isHighlighted) {
		console.log("Highlighting:", text);
	}
	useEffect(() => {
		const fetchImage = async () => {
			// IndexedDBからキャッシュを確認
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
				// IndexedDBに保存
				await saveImageToIndexedDB(`image_${text}`, generatedImage);
			}
		};
		fetchImage();

		// クリーンアップ関数
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
		<div className="text-red-500 h-full w-full relative">
			{image && <img src={image} alt={text} className="max-h-32" />}
			<button
				type="button"
				className={`flex absolute bottom-2 backdrop-blur-lg right-2 gap-2 items-center transition-all ${
					isHighlighted
						? "bg-red-500/80 hover:bg-red-600/80"
						: "bg-orange-500/80 shadow-md shadow-red-500/80 hover:bg-orange-600/80"
				} text-white font-bold py-1 px-2 rounded-xl`}
				onClick={() => handleBlockNameClick(text)}
			>
				<span
					className={`transition-transform p-1 px-2 duration-300 ease-in-out transform ${
						isHighlighted ? "rotate-90" : "rotate-0"
					}`}
				>
					{isHighlighted ? <X /> : <Puzzle />}
				</span>
			</button>
		</div>
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

	const [highlightedBlock, setHighlightedBlock] = useAtom(
		highlightedBlockState,
	);

	const workspace = Blockly.getMainWorkspace();
	const blockName = workspace?.getBlockById(text)?.type;

	// useStateとuseEffectを使わずに、直接isHighlightedを計算する
	const isHighlighted = highlightedBlock?.blockId === text;

	return (
		<span className="text-red-500 h-full w-full text-wrap text-xs">
			<button
				type="button"
				className={`inline-flex items-center transition-all ${
					isHighlighted
						? "bg-red-500 hover:bg-red-600"
						: "bg-orange-500 shadow-md shadow-red-500 hover:bg-orange-600"
				} text-white font-bold rounded-xl`}
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
			</button>
		</span>
	);
}

export { HighlightedBlockName, HighlightedBlockId };
