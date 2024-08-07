import {
	Bot,
	MenuSquare,
	Puzzle,
	ScanSearch,
	Server,
	User,
	X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Dialogue } from "../../../../../type.js";
import Markdown from "react-markdown";
import { useAtom } from "jotai";
import {
	blockNameFromMenuState,
	highlightedBlockState,
} from "../../../../state.js";
import * as Accordion from "@radix-ui/react-accordion";

export default function TextBubble(props: { item: Dialogue }) {
	const [highlightedBlock, setHighlightedBlock] = useAtom(
		highlightedBlockState,
	);
	const [blockNameFromMenu, setBlockNameFromMenu] = useAtom(
		blockNameFromMenuState,
	);

	const { t } = useTranslation();

	const handleHighlightClick = (blockId: string) => {
		if (highlightedBlock?.blockId === blockId) {
			//スイッチオフ
			setHighlightedBlock(null);
		} else {
			//スイッチオン
			setHighlightedBlock({ blockId, workspace: null });
			setBlockNameFromMenu(null);
		}
	};

	const handleBlockNameClick = (blockName: string) => {
		if (blockNameFromMenu === blockName) {
			//スイッチオフ
			setBlockNameFromMenu(null);
		} else {
			//スイッチオン
			setBlockNameFromMenu(blockName);
			setHighlightedBlock(null);
		}
	};

	const content = props.item.content as string;

	if (props.item.contentType === "user") {
		return (
			<div
				key={props.item.id}
				className="flex justify-start flex-row-reverse items-end gap-2"
			>
				<div className="text-gray-600 flex flex-col items-center">
					<span className="bg-gray-200 rounded-full p-2">
						<User />
					</span>
					<p className="text-xs">{t("textbubble.you")}</p>
				</div>
				<div className="rounded-2xl rounded-br-none bg-gray-300 text-gray-800 p-3 shadow max-w-xs">
					<p className="prose">
						<Markdown>{content}</Markdown>
					</p>{" "}
				</div>
			</div>
		);
	}
	if (props.item.contentType === "ai") {
		return (
			<div key={props.item.id} className="flex justify-start items-end gap-2">
				<div className="text-gray-600 flex flex-col items-center">
					<span className="bg-gray-200 rounded-full p-2">
						<Bot />
					</span>
					<p className="text-xs">{t("textbubble.ai")}</p>
				</div>
				<div className="rounded-2xl rounded-bl-none bg-sky-200 text-white p-3 shadow max-w-xs">
					<p className="prose">
						<Markdown>{content}</Markdown>
					</p>{" "}
				</div>
			</div>
		);
	}
	if (
		props.item.contentType === "group_log" &&
		Array.isArray(props.item.content)
	) {
		return (
			<div key={props.item.id} className="flex justify-start items-end gap-2">
				<div className="text-gray-600 flex flex-col items-center">
					<span className="bg-gray-200 rounded-full p-2">
						<Server />
					</span>
					<p className="text-xs">{t("textbubble.server")}</p>
				</div>
				<div className="text-gray-200 bg-gray-800 rounded-2xl p-3 max-w-xs w-full">
					<p className="text-xs font-semibold text-gray-200 w-full rounded-full p-2 bg-gray-700">
						{t("textbubble.log")}:
					</p>
					<div className="prose-invert flex flex-col gap-2">
						{props.item.content.map((logItem, index) => (
							<p
								className={`text-sm font-mono ${logItem.contentType === "error" ? "text-red-500" : ""}`}
								key={logItem.id}
							>
								{logItem.content as string}
							</p>
						))}
					</div>
				</div>
			</div>
		);
	}
	if (
		props.item.contentType === "blockId" &&
		props.item.contentType !== (null || undefined)
	) {
		const isHighlighted = highlightedBlock?.blockId === props.item.content;
		return (
			<div key={props.item.id} className="flex justify-start items-end gap-2">
				<div className="text-gray-600 flex flex-col items-center">
					<span className="bg-gray-200 rounded-full p-2">
						<Puzzle />
					</span>
					<p className="text-xs">{t("textbubble.block")}</p>
				</div>
				<div className="text-gray-800 bg-transparent rounded-2xl p-3 max-w-xs w-full">
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
	if (
		props.item.contentType === "blockName" &&
		props.item.contentType !== (null || undefined)
	) {
		const isHighlighted = blockNameFromMenu === props.item.content;
		return (
			<div key={props.item.id} className="flex justify-start items-end gap-2">
				<div className="text-gray-600 flex flex-col items-center">
					<span className="bg-gray-200 rounded-full p-2">
						<Puzzle />
					</span>
					<p className="text-xs">{t("textbubble.block")}</p>
				</div>
				<div className="text-gray-800 bg-transparent rounded-2xl p-3 max-w-xs w-full">
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

	return null; // エラー回避のためにデフォルトでnullを返す
}
