import { useState, useEffect, useRef } from "react";
import * as Blockly from "blockly";
import type { TFunction } from "i18next";
import { MenuSquare, Puzzle, X } from "lucide-react";
import { workspaceToPngBase64 } from "../../../../workspaceToPng.js";
import Theme from "../../../Blockly/theme/index.js";
import "../../../../../styles/blockly.css";

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
		if (!hiddenWorkspaceRef.current) {
			const hiddenDiv = document.createElement("div");
			hiddenDiv.style.width = "100vw"; // 適切な幅を設定
			hiddenDiv.style.height = "100vh"; // 適切な高さを設定
			hiddenDiv.style.position = "absolute";
			hiddenDiv.style.top = "-100vh"; // 画面外に配置
			hiddenDiv.style.left = "-100vw"; // 画面外に配置
			hiddenDiv.style.visibility = "hidden"; // 画面外に配置

			document.body.appendChild(hiddenDiv);
			hiddenDivRef.current = hiddenDiv; // refにdivを保持

			hiddenWorkspaceRef.current = Blockly.inject(hiddenDiv, {
				readOnly: true,
				renderer: "zelos",
				theme: Theme,
			});
		}

		const workspaceSvg = hiddenWorkspaceRef.current;

		// ブロックを追加
		const block = workspaceSvg.newBlock(content);
		block.initSvg();

		// ブロックをレンダリング
		block.render();

		// ワークスペースの画像を生成
		workspaceToPngBase64(workspaceSvg).then((base64) => {
			console.log("base64", base64);
			setBase64(base64);
		});

		// クリーンアップ
		return () => {
			if (workspaceSvg) {
				workspaceSvg.clear(); // ワークスペースを破棄してメモリリークを防ぐ
			}
			if (hiddenDivRef.current) {
				document.body.removeChild(hiddenDivRef.current); // divを削除
				hiddenDivRef.current = null; // refをリセット
			}
		};
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
