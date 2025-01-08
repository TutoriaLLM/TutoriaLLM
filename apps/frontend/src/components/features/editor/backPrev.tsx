import { Button, buttonVariants } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BackToPrevPage({ breadCrumbs }: { breadCrumbs?: string[] }) {
	const router = useRouter();
	const { t } = useTranslation();

	const onBack = () => {
		router.history.back();
	};

	return (
		<div className="flex items-center gap-3">
			<Button onClick={onBack}>
				<ChevronLeft />
				{t("general.back")}
			</Button>

			{breadCrumbs && breadCrumbs.length > 0 && (
				<div className="flex items-center gap-1">
					{breadCrumbs.map((crumb, index) => {
						const isLast = index === breadCrumbs.length - 1;
						return (
							<div
								key={index}
								className="flex items-center text-sm text-accent-foreground"
							>
								{/* 区切り文字 (例として"/"など) は必要に応じて変更してください */}
								{index > 0 && <span className="mx-1">/</span>}

								{/* 最後の要素であればテキスト表示のみ、それ以外はクリック可能ボタン */}
								{isLast ? (
									<span>{crumb}</span>
								) : (
									<Link
										className={buttonVariants({
											variant: "ghost",
										})}
										href={`/${breadCrumbs?.slice(0, index + 1).join("/")}`}
									>
										{crumb}
									</Link>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
