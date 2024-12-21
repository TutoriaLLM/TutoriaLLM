import Heatmap from "@/components/features/admin/heatmap.js";
import type { Clicks, SessionValue } from "@/type.js";
import { SquareDashedMousePointer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Summary(props: { session: SessionValue }) {
	const session = props.session;
	const clicks = session.clicks;
	const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
	const imageRef = useRef<HTMLDivElement>(null);
	const [showHeatmap, setShowHeatmap] = useState(false); // ヒートマップの表示状態を管理するための状態

	const { t } = useTranslation();

	const updateDisplaySize = () => {
		if (imageRef.current) {
			const { width, height } = imageRef.current.getBoundingClientRect();
			setDisplaySize({ width, height });
		}
	};

	useEffect(() => {
		// 最初のレンダリング時とウィンドウサイズが変更された時に、updateDisplaySizeを呼び出す
		updateDisplaySize(); // 初回レンダリング時にも呼び出す

		window.addEventListener("resize", updateDisplaySize);
		return () => {
			window.removeEventListener("resize", updateDisplaySize);
		};
	}, []);

	// 相対座標を絶対座標に変換する関数
	const convertToAbsoluteCoordinates = (
		clicks: Clicks,
		width: number,
		height: number,
	) => {
		return clicks?.map((click) => ({
			x: click.x * width,
			y: click.y * height,
			value: click.value,
			timestamp: click.timestamp,
		}));
	};

	// 画像のサイズに基づいてクリックを絶対座標に変換
	const absoluteClicks =
		displaySize.width > 0 && displaySize.height > 0
			? convertToAbsoluteCoordinates(
					clicks,
					displaySize.width,
					displaySize.height,
				)
			: [];

	return (
		<div
			style={{ position: "relative", width: "100%", height: "100%" }}
			className="w-full rounded-2xl bg-gray-200 p-2 flex flex-col gap-2"
		>
			<h2 className="text-lg">{t("admin.sessionSummary")}</h2>

			{session.screenshot ? (
				<div>
					<button
						type="button"
						className={`flex gap-2 text-sm items-center transition-colors ${
							showHeatmap
								? "bg-red-500 hover:bg-red-600"
								: "bg-orange-500 hover:bg-orange-600"
						} text-white font-bold py-1 px-2 rounded-full`}
						onClick={() => setShowHeatmap(!showHeatmap)}
					>
						<span
							className={`transition-transform duration-300 ease-in-out transform ${
								showHeatmap ? "rotate-90" : "rotate-0"
							}`}
						>
							{showHeatmap ? <X /> : <SquareDashedMousePointer />}
						</span>
						{t("admin.showHeatmap")}
					</button>
					<div ref={imageRef} style={{ position: "relative" }}>
						<img
							src={session.screenshot}
							alt="Session Screenshot"
							style={{ width: "100%", height: "auto" }}
						/>
						{showHeatmap && displaySize.width > 0 && displaySize.height > 0 && (
							<Heatmap
								clicks={absoluteClicks || []} // 絶対座標のクリックデータを渡す
								width={displaySize.width}
								height={displaySize.height}
								className="absolute top-0 left-0"
							/>
						)}
					</div>
				</div>
			) : (
				<p>{t("admin.noScreenshotAvailable")}</p>
			)}

			<div style={{ marginTop: "10px" }}>
				{session?.llmContext ? session.llmContext : "No context available"}
			</div>
		</div>
	);
}
