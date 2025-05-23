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
	const { session: sessionId } = props; // Accepts a string session sessionId
	const { t } = useTranslation();

	const { session } = useSession(sessionId, 5000);

	if (!session) {
		return <p className="text-accent-foreground">{t("admin.loading")}</p>;
	}

	return (
		<div className="w-full h-full overflow-y-auto flex flex-col gap-3 relative">
			<p className="text-accent-foreground text-base">
				{t("admin.sessionCode")}: {session.sessionId}
			</p>
			<p className="text-accent-foreground text-base">
				{t("admin.sessionLanguage")}: {langToStr(session.language || "en")}
			</p>
			<p className="text-accent-foreground text-base">
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
