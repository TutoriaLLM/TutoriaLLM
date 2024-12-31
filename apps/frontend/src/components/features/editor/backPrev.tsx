import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackToPrevPage({ breadCrumbs }: { breadCrumbs?: string[] }) {
	const router = useRouter();

	const onBack = () => {
		router.history.back();
	};

	// パンくずリストをクリックしたときに遷移する関数
	const onNavigate = (index: number) => {
		// クリックされたパンくずの位置までを結合してパスを生成
		const path = `/${breadCrumbs?.slice(0, index + 1).join("/")}`;
		router.navigate({ to: path });
	};

	return (
		<div className="flex items-center gap-3">
			<Button onClick={onBack}>
				<ChevronLeft className="w-5 h-5" />
				Back
			</Button>

			{breadCrumbs && breadCrumbs.length > 0 && (
				<div className="flex items-center gap-1">
					{breadCrumbs.map((crumb, index) => {
						const isLast = index === breadCrumbs.length - 1;
						return (
							<div
								key={index}
								className="flex items-center text-sm text-gray-500"
							>
								{/* 区切り文字 (例として"/"など) は必要に応じて変更してください */}
								{index > 0 && <span className="mx-1">/</span>}

								{/* 最後の要素であればテキスト表示のみ、それ以外はクリック可能ボタン */}
								{isLast ? (
									<span>{crumb}</span>
								) : (
									<Button
										variant="transparent"
										onClick={() => onNavigate(index)}
									>
										{crumb}
									</Button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
