import { getSession } from "@/api/session";
import { TourProvider } from "@reactour/tour";
import { createFileRoute } from "@tanstack/react-router";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Editor from "@/components/common/Blockly/index.js";
import DialogueView from "@/components/features/editor/dialogue/index.js";
import Navbar from "@/components/features/editor/navbar.js";
import { Onboarding } from "@/components/features/editor/onboarding.js";
import { useConfig } from "@/hooks/config.js";
import { useIsMobile } from "@/hooks/useMobile.js";
import { getSocket } from "@/libs/socket.js";
import { queryClient } from "@/main.js";
import {
	LanguageToStart,
	currentSessionState,
	currentTabState,
	isWorkspaceCodeRunning,
	isWorkspaceConnected,
	prevSessionState,
	socketIoInstance,
} from "@/state.js";
import type { Clicks, SessionValue, Tab } from "@/type.js";
import * as Tabs from "@radix-ui/react-tabs";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import i18next from "i18next";
import { useAtom, useSetAtom } from "jotai";
import { MessageCircleMore, PanelRightClose, Puzzle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type Operation, applyPatch, createPatch } from "rfc6902";
import { tourSteps } from "../pages/editorTour.js";

const sessionQueryOptions = (sessionCode: string) =>
	queryOptions({
		queryKey: ["session", sessionCode],
		queryFn: () => getSession({ key: sessionCode }),
	});

export const Route = createFileRoute("/$sessionCode")({
	component: RouteComponent,
	loader: async ({ params }) =>
		queryClient.ensureQueryData(sessionQueryOptions(params.sessionCode)),
});

function RouteComponent() {
	const { sessionCode } = Route.useParams();
	const { data: session } = useSuspenseQuery(sessionQueryOptions(sessionCode));
	const isMobile = useIsMobile();
	const [activeTab, setActiveTab] = useAtom(currentTabState);
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	const [prevSession, setPrevSession] = useAtom(prevSessionState);
	const recordedClicksRef = useRef<Clicks>([]);
	const currentSessionRef = useRef<SessionValue | null>(null);
	const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);

	const [WorkspaceConnection, setWorkspaceConnection] =
		useAtom(isWorkspaceConnected);
	const [socketInstance, setSocketInstance] = useAtom(socketIoInstance);
	const setIsCodeRunning = useSetAtom(isWorkspaceCodeRunning);
	const isInternalUpdateRef = useRef(true); // useRef でフラグを管理

	const [isMenuOpen, setIsMenuOpen] = useState(true);
	function handleToggle() {
		if (isMobile) setIsMenuOpen((prev) => !prev);
	}
	const { t } = useTranslation();
	const { config } = useConfig();

	useEffect(() => {
		i18next.changeLanguage(languageToStart);
	}, [languageToStart]);

	useEffect(() => {
		const socket = getSocket(sessionCode, session.uuid);

		console.warn("sessionCode", sessionCode);

		function onConnect() {
			console.log("connected");
			setWorkspaceConnection(true);
			setSocketInstance(socket); // Socketインスタンスを保存
		}

		function onDisconnect(reason: string) {
			console.log("disconnect", reason);
			setWorkspaceConnection(false);
			setSocketInstance(null); // Socketインスタンスをクリア
		}

		function onPushedCurrentSession(data: SessionValue) {
			isInternalUpdateRef.current = false; // フラグを useRef に基づいて更新
			console.log("Received current session from server!", data);
			setCurrentSession(data);
			setPrevSession(data);
			setIsCodeRunning(data?.isVMRunning ?? false);
			isInternalUpdateRef.current = true; // フラグをリセット
		}

		function onReceivedDiff(diff: Operation[]) {
			isInternalUpdateRef.current = false; // フラグを useRef に基づいて更新
			console.log("Received session diff from server!", diff);

			// 差分を currentSession に適用
			setCurrentSession((prevSession) => {
				setPrevSession(prevSession); // 前回のセッションを保存
				if (prevSession) {
					const updatedSession = { ...prevSession }; // 現在のセッションのコピーを作成
					applyPatch(updatedSession, diff); // 差分を適用
					setIsCodeRunning(updatedSession?.isVMRunning ?? false);
					return updatedSession; // 更新されたセッションを返す
				}
				console.error("Current session is null.");
				return prevSession;
			});

			isInternalUpdateRef.current = true; // フラグをリセット
		}

		function onReceivedReplyingNotification() {
			console.log("Received isReplying notification for sender");
			setCurrentSession((prev) => {
				if (prev) {
					return {
						...prev,
						isReplying: true,
					};
				}
				return prev;
			});
		}

		async function onReceivedScreenshotRequest() {
			console.log("Received screenshot request");
			const image = await takeScreenshot();
			setCurrentSession((prev) => {
				if (prev) {
					return {
						...prev,
						screenshot: image,
						clicks: recordedClicksRef.current, // 最新のクリック情報を使用
					};
				}
				return prev;
			});
		}

		setCurrentSession(session);
		setPrevSession(session);
		i18next.changeLanguage(session.language ?? "en");

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("PushCurrentSession", onPushedCurrentSession);
		socket.on("PushSessionDiff", onReceivedDiff);
		socket.on("notifyIsReplyingforSender", onReceivedReplyingNotification);
		socket.on("RequestScreenshot", onReceivedScreenshotRequest);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("PushCurrentSession", onPushedCurrentSession);
			socket.off("PushSessionDiff", onReceivedDiff);
			socket.off("notifyIsReplyingforSender", onReceivedReplyingNotification);
			socket.off("RequestScreenshot", onReceivedScreenshotRequest);
		};
	}, [sessionCode]);

	// スクリーンショットの撮影機能
	async function takeScreenshot() {
		const element = document.body; // スクリーンショットを撮りたい要素
		const canvas = await html2canvas(element); // html2canvasの型定義がおかしいためanyで回避
		const imgData = canvas.toDataURL("image/png", 0.3); // Base64形式の画像データ
		return imgData;
	}

	const handleClick = (event: MouseEvent) => {
		const prev = recordedClicksRef.current;
		const now = Date.now();
		const intervalMin = config?.Client_Settings.Screenshot_Interval_min ?? 1;
		const updatedClicks = prev?.filter(
			(click) => now - click.timestamp <= intervalMin * 60 * 1000,
		);

		const target = event.target as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width;
		const y = (event.clientY - rect.top) / rect.height;

		const click = {
			x: x,
			y: y,
			value: 1,
			timestamp: now,
		};
		console.log(click);

		// 新しいクリックを追加して、配列の最後の20件のみを保持する
		const newClicks = [...(updatedClicks ?? []), click].slice(-20);

		// 最新のクリック情報をrefに更新
		recordedClicksRef.current = newClicks;

		return newClicks;
	};
	window.addEventListener("click", handleClick);

	useEffect(() => {
		// currentSession が変更されるたびに ref を更新する
		currentSessionRef.current = currentSession;
		if (socketInstance && currentSession) {
			//アップデートの対象となるデータがあるか確認
			if (
				JSON.stringify(currentSession.workspace) !==
					JSON.stringify(prevSession?.workspace) ||
				JSON.stringify(currentSession.dialogue) !==
					JSON.stringify(prevSession?.dialogue) ||
				JSON.stringify(currentSession.userAudio) !==
					JSON.stringify(prevSession?.userAudio) ||
				JSON.stringify(currentSession.screenshot) !==
					JSON.stringify(prevSession?.screenshot) ||
				JSON.stringify(currentSession.clicks) !==
					JSON.stringify(prevSession?.clicks)
			) {
				// セッションの差分を計算し、sendDataToServerを利用する
				if (prevSession && isInternalUpdateRef.current) {
					// 差分を計算
					const diff = createPatch(prevSession, currentSession);
					console.log("diff:", diff);

					// 差分がある場合のみ送信し、prevSessionを更新
					if (diff.length > 0) {
						socketInstance?.emit("UpdateCurrentSessionDiff", diff);
						console.log(
							"Sent session diff to server and saved prev session:",
							diff,
						);
						setPrevSession(currentSession);
					}
				} else {
					// 前回のセッションがない場合、空のオブジェクトと比較
					const diff = createPatch({}, currentSession);

					console.log("diff for empty session:", diff);

					// 差分を送信
					socketInstance?.emit("UpdateCurrentSessionDiff", diff);
					setPrevSession(currentSession);
					console.log(
						"Sent initial session diff to server and saved prev session:",
						diff,
					);
				}
			}
		}
	}, [currentSession, socketInstance]);
	return (
		<TourProvider
			steps={tourSteps(isMobile)}
			disableFocusLock
			className="w-64 sm:w-full font-medium text-base border"
			padding={{
				popover: [-10, 0],
			}}
			styles={{
				popover: (base) => ({
					...base,
					"--reactour-accent": "#38bdf8",
					borderRadius: 10,
					padding: "16px",
					paddingTop: "42px",
					gap: "16px",
					zIndex: 100000,
				}),
				maskArea: (base) => ({ ...base, rx: 10 }),
			}}
		>
			<Onboarding currentSession={currentSession} />
			<div className="max-h-svh h-svh w-svw overflow-hidden flex flex-col bg-gray-200 text-gray-800 app">
				<Navbar
					code={sessionCode}
					isConnected={WorkspaceConnection}
					isTutorial={currentSession?.tutorial?.isTutorial ?? false}
					tutorialProgress={currentSession?.tutorial?.progress ?? 0}
				/>
				<div className="flex-1 overflow-hidden relative">
					<button
						type="button"
						onClick={handleToggle}
						className={`absolute sm:hidden w-8 h-8 top-2 left-4 flex items-center justify-center transition-transform ${
							isMenuOpen ? "rotate-180" : ""
						}`}
					>
						<PanelRightClose />
					</button>
					{isMobile ? (
						<Tabs.Root
							defaultValue="workspaceTab"
							value={activeTab}
							onValueChange={(value) => setActiveTab(value as Tab)}
							className="w-full h-full flex flex-col"
						>
							<Tabs.List className="flex-shrink-0 flex justify-center gap-2 p-2 font-semibold text-xs tabs">
								<Tabs.Trigger
									className="p-2 rounded-lg flex gap-2 hover:bg-gray-200 hover:shadow-none data-[state=active]:bg-gray-300 data-[state=active]:shadow shadow-inner workspaceTab"
									value="workspaceTab"
								>
									<Puzzle className="w-4 h-4" />
									{t("editor.workspaceTab")}
								</Tabs.Trigger>
								<Tabs.Trigger
									className="p-2 rounded-lg flex gap-2 hover:bg-gray-200 hover:shadow-none data-[state=active]:bg-gray-300 data-[state=active]:shadow shadow-inner dialogueTab"
									value="dialogueTab"
								>
									<MessageCircleMore className="w-4 h-4" />
									{t("editor.dialogueTab")}
								</Tabs.Trigger>
							</Tabs.List>
							<div className="flex-grow overflow-hidden h-full w-full">
								<Tabs.Content
									className="w-full h-full overflow-auto"
									value="workspaceTab"
									asChild
								>
									<Editor
										isConnecting={WorkspaceConnection}
										menuOpen={isMenuOpen}
										language={session.language ?? "en"}
									/>
								</Tabs.Content>
								<Tabs.Content
									className="w-full h-full overflow-auto"
									value="dialogueTab"
									asChild
								>
									<DialogueView />
								</Tabs.Content>
							</div>
						</Tabs.Root>
					) : (
						<PanelGroup autoSaveId="workspace" direction="horizontal">
							<Panel
								id="workspaceArea"
								defaultSize={75}
								order={1}
								maxSize={80}
								minSize={20}
							>
								<Editor
									isConnecting={WorkspaceConnection}
									menuOpen={isMenuOpen}
									language={session.language ?? "en"}
								/>
							</Panel>
							<PanelResizeHandle className="h-full group w-3 transition bg-gray-400 hover:bg-gray-500 active:bg-sky-600 flex flex-col justify-center items-center gap-1">
								<div className="py-2 px-1 z-50 flex flex-col gap-1">
									<span className="rounded-full p-1  bg-gray-200 group-hover:bg-gray-100 group-active:bg-sky-300" />
									<span className="rounded-full p-1  bg-gray-200 group-hover:bg-gray-100 group-active:bg-sky-300" />
									<span className="rounded-full p-1  bg-gray-200 group-hover:bg-gray-100 group-active:bg-sky-300" />
								</div>
							</PanelResizeHandle>
							<Panel
								id="dialogueArea"
								defaultSize={25}
								order={2}
								maxSize={80}
								minSize={20}
							>
								<DialogueView />
							</Panel>
						</PanelGroup>
					)}
				</div>
			</div>
		</TourProvider>
	);
}
