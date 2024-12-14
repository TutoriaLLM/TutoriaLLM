import { useSession } from "@/hooks/session.js";
import { langToStr } from "@/utils/langToStr.js";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WorkspacePreview from "../ui/workspacePreview.js";
import Stats from "./stats.js";
import Summary from "./summary.js";
import Time from "./time.js";
import SelectedTutorial from "./tutorial.js";

export function SessionValueView(props: { session: string }) {
	const { session: sessionCode } = props; // 文字列のセッションコードを受け取る
	const { t } = useTranslation();

	// State management for session data, errors, and loading state
	const [error, setError] = useState<string | null>(null);

	const { session } = useSession(sessionCode, 5000);

	if (error) {
		return (
			<p className="text-red-500">
				{t("admin.error")}: {error}
			</p>
		);
	}

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
			<Tabs.Root
				defaultValue="summaryView"
				className="w-full h-full flex flex-col"
			>
				<Tabs.List className="flex-shrink-0 flex justify-center gap-2 p-2 font-semibold text-xs">
					<Tabs.Trigger
						className="p-2 rounded-lg flex gap-2 hover:bg-gray-200 hover:shadow-none data-[state=active]:bg-gray-300 data-[state=active]:shadow shadow-inner"
						value="summaryView"
					>
						{t("admin.summary")}
					</Tabs.Trigger>
					<Tabs.Trigger
						className="p-2 rounded-lg flex gap-2 hover:bg-gray-200 hover:shadow-none data-[state=active]:bg-gray-300 data-[state=active]:shadow shadow-inner"
						value="workspaceView"
					>
						{t("admin.workspace")}
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content className="w-full h-full" value="workspaceView">
					<WorkspacePreview session={session} />
				</Tabs.Content>
				<Tabs.Content className="w-full h-full" value="summaryView">
					<Summary session={session} />
				</Tabs.Content>
			</Tabs.Root>
			<Stats session={session} />
			<Time session={session} />
			<SelectedTutorial session={session} />
		</div>
	);
}
