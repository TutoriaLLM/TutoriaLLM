import { useTranslation } from "react-i18next";
import type { SessionValue } from "../../../type.js";
import { langToStr } from "../../../utils/langToStr.js";
import LLMContext from "./llmContext.js";
import Stats from "./stats.js";
import Time from "./time.js";
import SelectedTutorial from "./tutorial.js";
import WorkspacePreview from "./workspacePreview.js";
import * as Tabs from "@radix-ui/react-tabs";
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";

export function SessionValueView(props: { session: string }) {
	const { session: sessionCode } = props; // 文字列のセッションコードを受け取る
	const { t } = useTranslation();

	// State management for session data, errors, and loading state
	const [session, setSession] = useState<SessionValue | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [showLoader, setShowLoader] = useState(true); // 表示状態を管理

	useEffect(() => {
		if (!loading) {
			// loadingがfalseになったら1秒後にshowLoaderをfalseに設定
			const timer = setTimeout(() => {
				setShowLoader(false);
			}, 1000);

			// クリーンアップ関数を使用してタイマーをクリア
			return () => clearTimeout(timer);
		}
		// loadingがtrueのときにはshowLoaderをtrueにリセット
		setShowLoader(true);
	}, [loading]);

	// Function to fetch session data
	async function fetchSessionData(code: string) {
		setLoading(true); // Set loading state to true
		try {
			const response = await fetch(`/api/session/${code}`);
			if (!response.ok || response.status === 404) {
				throw new Error(response.statusText);
			}
			const data = (await response.json()) as SessionValue;
			setSession(data); // Set fetched session data to state
		} catch (error: any) {
			setError(error.message); // Handle errors
		} finally {
			setLoading(false); // Set loading state to false
		}
	}

	// Fetch data on component mount and every 10 seconds
	useEffect(() => {
		if (sessionCode) {
			fetchSessionData(sessionCode); // Fetch data based on sessionCode

			const intervalId = setInterval(() => {
				fetchSessionData(sessionCode);
			}, 5000); // Fetch data every 5 seconds

			return () => clearInterval(intervalId); // Clear interval on component unmount
		}
	}, [sessionCode]);

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
			{showLoader && (
				<span className="text-gray-600 absolute top-5 right-5 animate-spin">
					<LoaderCircle />
				</span>
			)}{" "}
			<h1 className="text-2xl font-bold">{t("admin.sessionAnalytics")}</h1>
			<p className="text-gray-600 text-base">
				{t("admin.sessionCode")}: {session.sessioncode}
			</p>
			<p className="text-gray-600 text-base">
				{t("admin.sessionLanguage")}: {langToStr(session.language)}
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
				<Tabs.Content className="w-full h-full" value="workspaceView" asChild>
					<WorkspacePreview session={session} />
				</Tabs.Content>
				<Tabs.Content className="w-full h-full" value="summaryView" asChild>
					<LLMContext session={session} />
				</Tabs.Content>
			</Tabs.Root>
			<Stats session={session} />
			<Time session={session} />
			<SelectedTutorial session={session} />
		</div>
	);
}
