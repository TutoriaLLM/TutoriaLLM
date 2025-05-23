import { Button, buttonVariants } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BackToPrevPage({
	breadCrumbs,
}: {
	breadCrumbs?: {
		slug: string;
		label: string;
	}[];
}) {
	const router = useRouter();
	const { t } = useTranslation();

	const onBack = () => {
		router.history.back();
	};

	return (
		<div className="flex items-center gap-3 w-full">
			<Button onClick={onBack}>
				<ChevronLeft />
				{t("general.back")}
			</Button>

			{breadCrumbs && breadCrumbs.length > 0 && (
				<div className="flex items-center gap-1 flex-wrap">
					{breadCrumbs.map((crumb, index) => {
						const isLast = index === breadCrumbs.length - 1;
						return (
							<div
								key={index}
								className="flex items-center text-sm text-accent-foreground"
							>
								{index > 0 && <span className="mx-1">/</span>}

								{isLast ? (
									<span>{crumb.label}</span>
								) : (
									<Link
										className={buttonVariants({
											variant: "ghost",
										})}
										href={`/${breadCrumbs
											?.slice(0, index + 1)
											.map((crumb) => crumb.slug)
											.join("/")}`}
									>
										{crumb.label}
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
