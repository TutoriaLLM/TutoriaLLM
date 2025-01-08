import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/admin/")({
	component: Dashboard, // This is the main
});

function Dashboard() {
	const { t } = useTranslation();
	return (
		<div className="overflow-auto bg-background rounded-2xl text-foreground border">
			<div className="flex w-full h-full justify-between items-center p-3">
				<span className="text-foreground">
					<h2 className="text-3xl font-semibold"> {t("admin.welcome")} </h2>
					{t("admin.dashboard")}
				</span>
				<img src="/logo.svg" alt="logo" className="max-w-48 aspect-square" />
			</div>
			<div className="w-full h-full p-3 flex flex-col gap-3">
				<Link
					to="/admin/tutorials"
					className="bg-card border shadow-lg rounded-2xl p-2 px-4 col-span-3 flex justify-between items-center group hover:bg-card/80 transition-all max-w-xl"
				>
					<span className="w-full text-left">
						<h2 className="text-3xl font-semibold">{t("admin.tutorials")} </h2>
						<p className="text-accent-foreground ml-auto">
							{t("admin.tutorialsDescription")}
						</p>
					</span>
					<ArrowRight />
				</Link>
				<Link
					to="/admin/sessions"
					className="bg-card border shadow-lg rounded-2xl p-2 px-4 col-span-3 flex justify-between items-center group hover:bg-card/80 transition-all max-w-xl"
				>
					<span className="w-full text-left">
						<h2 className="text-3xl font-semibold"> {t("admin.sessions")} </h2>
						<p className="text-accent-foreground ml-auto">
							{t("admin.sessionsDescription")}
						</p>
					</span>
					<ArrowRight />
				</Link>

				<Link
					to="/admin/training"
					className="bg-card border shadow-lg rounded-2xl p-2 px-4 col-span-3 flex justify-between items-center group hover:bg-card/80 transition-all max-w-xl"
				>
					<span className="w-full text-left">
						<h2 className="text-3xl font-semibold"> {t("admin.training")} </h2>
						<p className="text-accent-foreground ml-auto">
							{t("admin.trainingDescription")}
						</p>
					</span>
					<ArrowRight />
				</Link>
			</div>
		</div>
	);
}
