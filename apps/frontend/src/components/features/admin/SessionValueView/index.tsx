import Stats from "@/components/features/admin/SessionValueView/stats";
import Summary from "@/components/features/admin/SessionValueView/summary";
import Time from "@/components/features/admin/SessionValueView/time";
import SelectedTutorial from "@/components/features/admin/SessionValueView/tutorial";
import WorkspacePreview from "@/components/features/admin/workspacePreview";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs.js";
import { useSession } from "@/hooks/session.js";
import { langToStr } from "@/utils/langToStr.js";
import { useTranslation } from "react-i18next";

export function SessionValueView(props: { session: string }) {
	const { session: sessionCode } = props; // Accepts a string session code
	const { t } = useTranslation();

	const { session } = useSession(sessionCode, 5000);

	if (!session) {
		return <p className="text-gray-600">{t("admin.loading")}</p>;
	}

	return (
		<div className="w-full flex flex-col gap-3 relative">
			<h1 className="text-2xl font-bold">{t("admin.sessionAnalytics")}</h1>
			<p className="text-gray-600 text-base">
				{t("admin.sessionCode")}: {session.sessioncode}
			</p>
			<p className="text-gray-600 text-base">
				{t("admin.sessionLanguage")}: {langToStr(session.language || "en")}
			</p>
			<p className="text-gray-600 text-base">
				{t("admin.sessionEasyMode")}: {session.easyMode ? t("on") : t("off")}
			</p>
			<Tabs defaultValue="summaryView" className="w-full h-full flex flex-col">
				<TabsList>
					<TabsTrigger value="summaryView">{t("admin.summary")}</TabsTrigger>
					<TabsTrigger value="workspaceView">
						{t("admin.workspace")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="workspaceView">
					<WorkspacePreview session={session} />
				</TabsContent>
				<TabsContent value="summaryView">
					<Summary session={session} />
				</TabsContent>
			</Tabs>
			<Stats session={session} />
			<Time session={session} />
			<SelectedTutorial session={session} />
		</div>
	);
}
