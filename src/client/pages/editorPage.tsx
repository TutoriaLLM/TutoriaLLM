import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";
import type { AppConfig, Click, SessionValue, Tab } from "../../type.js";
import Editor from "../components/Editor/Blockly/index.js";
import Navbar from "../components/Editor/Navbar.js";
//モバイル利用時のタブ切り替え
import * as Tabs from "@radix-ui/react-tabs";

//言語の読み込み
import { useTranslation } from "react-i18next";

//ツアーの読み込み
import { TourProvider, useTour, type StepType } from "@reactour/tour";
import { tourSteps } from "./editorTour.js";

//視覚的な統計作成に利用するライブラリ
import html2canvas from "html2canvas";

//cookieの読み込み
import { useCookies } from "react-cookie";

import i18next, { use } from "i18next";
import DialogueView from "../components/Editor/dialogue/index.js";
import SessionPopup, {
	type sessionPopupMessageTypes,
} from "../components/Editor/sessionOverlay/index.js";
//stateの読み込み
import {
	LanguageToStart,
	currentSessionState,
	isPopupOpen,
	isWorkspaceCodeRunning,
	isWorkspaceConnected,
	prevSessionState,
	settingState,
	userSessionCode,
	socketIoInstance,
	currentTabState,
	blockNameFromMenuState,
} from "../state.js";

import { io, Socket } from "socket.io-client";
import { set } from "zod";
import { is } from "drizzle-orm";
import { MessageCircleMore, Puzzle, PanelRightClose } from "lucide-react";

export default function EditorPage() {
	const { code: codeFromPath } = useParams();
	const [sessionCode, setSessionCode] = useAtom(userSessionCode);
	// 現在のセッション情報
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	//比較するために前回の値を保存
	const [prevSession, setPrevSession] = useAtom(prevSessionState);

	//タブ切り替えのための状態
	const [activeTab, setActiveTab] = useAtom(currentTabState);
	//クリックの保存
	const [recordedClicks, setrecordedClicks] = useState<Click[]>([]);
	// 最新のクリック情報を保持するためのrefを追加
	const recordedClicksRef = useRef<Click[]>([]);

	const [showPopup, setShowPopup] = useAtom(isPopupOpen);
	const [WorkspaceConnection, setWorkspaceConnection] =
		useAtom(isWorkspaceConnected);
	const [socketInstance, setSocketInstance] = useAtom(socketIoInstance);
	const setIsCodeRunning = useSetAtom(isWorkspaceCodeRunning);

	//メニューのハイライトを管理するstate
	const blockNameFromMenu = useAtomValue(blockNameFromMenuState);

	//ワークスペースのメニュー表示を管理するstate
	const [isMenuOpen, setIsMenuOpen] = useState(true);

	//設定の保存をするstate
	const [settings, setSettings] = useAtom(settingState);

	const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

	const [cookie, setCookie, removeCookie] = useCookies();

	useEffect(() => {
		async function fetchConfig() {
			const result = await fetch("/api/config");
			const response = (await result.json()) as AppConfig;
			if (!response) {
				//Configが取得できない場合は、基本的にサーバーがダウンしているので、エラーを投げる
				setStatusMessage(t("session.serverDownMsg"));
				setMessageType("error");
			}
			setSettings(response);
		}
		try {
			fetchConfig();
			console.log("fetching settings...");
			//クリックの保存
			window.addEventListener("click", handleClick);

			//デバイス幅の変更を監視
			window.addEventListener("resize", () => {
				setIsMobile(window.innerWidth < 1024);
			});
		} catch (error) {
			console.error("Error fetching settings:", error);
		}
	}, []);

	//オンボーディングを起動するために内部に挿入するコンポーネント
	function OnboardingComponent() {
		const { setIsOpen } = useTour();
		const now = new Date();
		function startOnboarding() {
			console.log("start onboarding");
			setIsOpen(true);
			setCookie("lastonBoarding", now);
		}
		//セッション開始後にトリガーする
		if (cookie.lastonBoarding && currentSession) {
			const lastOnboarding = new Date(cookie.lastonBoarding);
			if (now.getTime() - lastOnboarding.getTime() > 1000 * 60 * 60 * 24) {
				console.log("cookie expired");
				startOnboarding();
			}
		}
		if (!cookie.lastonBoarding && currentSession) {
			console.log("cookie not found");
			startOnboarding();
		}
		return null;
	}

	// 状態更新の関数
	const handleClick = (event: MouseEvent) => {
		setrecordedClicks((prev) => {
			const now = Date.now();
			const intervalMin =
				settings?.Client_Settings.Screenshot_Interval_min ?? 1;
			const updatedClicks = prev.filter(
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
			const newClicks = [...updatedClicks, click].slice(-20);

			// 最新のクリック情報をrefに更新
			recordedClicksRef.current = newClicks;

			return newClicks;
		});
	};

	// UseEffect to log the updated recordedClicks after each update
	useEffect(() => {
		console.log("Updated recordedClicks:", recordedClicks);
	}, [recordedClicks]);

	//言語
	const languageToStart = useAtomValue(LanguageToStart);
	const { t } = useTranslation();

	const [statusMessage, setStatusMessage] = useState(t("session.typecodeMsg"));
	const [messageType, setMessageType] =
		useState<sessionPopupMessageTypes>("info");
	const timerRef = useRef<NodeJS.Timeout | null>(null); // タイマーを保持するためのref

	// URLパスにコードがあるか確認する
	useEffect(() => {
		//console.log("useEffect");
		//言語に応じたメッセージを表示
		setStatusMessage(t("session.typecodeMsg"));
		setMessageType("info");
		// URLにコードがある場合は状態を更新
		if (codeFromPath) {
			setSessionCode(codeFromPath);
			console.log("codeFromPath", codeFromPath);
		} else {
			setShowPopup(true);
			console.log("codeFromPath is empty");
		}
	}, [codeFromPath, languageToStart]);

	// セッションが存在するか確認する。一回目だけDBから取得し、以降はsocket.ioで更新する
	useEffect(() => {
		async function checkSession() {
			if (sessionCode !== "") {
				const response = await fetch(`/api/session/${sessionCode}`);
				if (response.status === 404) {
					// セッションが存在しない場合はスキップする
					console.log("code is invalid!");
					setStatusMessage(t("session.sessionNotFoundMsg"));
					setMessageType("error");
					setShowPopup(true);
				} else {
					const data: SessionValue = await response.json();
					//console.log(`code is valid!${JSON.stringify(data)}`);
					setCurrentSession(data);
					setPrevSession(data);
					connectSocket(data);
					i18next.changeLanguage(data.language);
				}
			}
		}

		if (sessionCode !== "") {
			checkSession();
		}
	}, [sessionCode, languageToStart]);

	// Socket.ioに接続する関数
	async function connectSocket(data: SessionValue) {
		const host = `${window.location.host}`;
		console.log(`processing socket.io connection: ${host}`);

		const socket = io(host, {
			path: "/api/session/socket/connect",
			query: {
				code: sessionCode,
				uuid: data.uuid,
			},
		});

		socket.on("connect", () => {
			console.log("connected");
			setWorkspaceConnection(true);
			setSocketInstance(socket); // Socketインスタンスを保存
		});

		socket.on("PushCurrentSession", (message: SessionValue) => {
			console.log("Received changed session data from server!");
			setCurrentSession(message);
			setIsCodeRunning(message.isVMRunning);
		});

		// スクリーンショットのリクエストを受信したときに最新のクリック情報を使用する
		socket.on("RequestScreenshot", async () => {
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
		});

		socket.on("disconnect", () => {
			console.log("disconnected");
			setWorkspaceConnection(false);
			setSocketInstance(null); // Socketインスタンスをクリア
		});
	}

	// currentSessionが変更されたら、内容をprevSessionと比較して内容が違う場合はSocketに送信する
	useEffect(() => {
		if (socketInstance && currentSession) {
			// 前回のセッションのワークスペース、対話、またはスクリーンショットの内容が違う場合のみ送信
			if (
				JSON.stringify(currentSession.workspace) !==
					JSON.stringify(prevSession?.workspace) ||
				JSON.stringify(currentSession.dialogue) !==
					JSON.stringify(prevSession?.dialogue) ||
				JSON.stringify(currentSession.screenshot) !==
					JSON.stringify(prevSession?.screenshot) ||
				JSON.stringify(currentSession.clicks) !==
					JSON.stringify(prevSession?.clicks)
			) {
				socketInstance.emit("UpdateCurrentSession", currentSession);
				setPrevSession(currentSession);
				console.log(
					"Sent currentSession to Socket and save prev session:",
					currentSession,
				);
			}

			// ワークスペースの内容が変更されかつ自動返信が有効の場合、一定時間後にAIにユーザーのワークスペースのフィードバックを要求する
			if (
				JSON.stringify(currentSession.workspace) !==
					JSON.stringify(prevSession?.workspace) &&
				settings?.Client_Settings.AutoReply
			) {
				if (timerRef.current) {
					clearTimeout(timerRef.current);
				}
				timerRef.current = setTimeout(() => {
					// ワークスペース更新後、最後のメッセージがユーザーでないかつ入力中でない場合
					if (
						currentSession?.dialogue.findLast((item) => !item.isuser) &&
						!currentSession.isReplying
					) {
						setCurrentSession((prev) => {
							if (prev) {
								setPrevSession(prev);
								const lastId =
									prev.dialogue.length > 0
										? prev.dialogue[prev.dialogue.length - 1].id
										: 0;
								return {
									...prev,
									dialogue: [
										...prev.dialogue,
										{
											id: lastId + 1,
											contentType: "request",
											isuser: true,
											content:
												"request for AI feedback. This message is automatically generated on the client side.",
										},
									],
									isReplying: true,
								};
							}
							return prev;
						});
					}
				}, settings?.Client_Settings.Reply_Time_ms); // 例として5秒後に送信
			}
		}
	}, [currentSession, socketInstance]);

	// 接続が切れた場合に再接続を試みる
	useEffect(() => {
		let reconnectInterval: NodeJS.Timeout;

		if (!WorkspaceConnection) {
			reconnectInterval = setInterval(() => {
				console.log("Attempting to reconnect...");
				if (sessionCode) {
					// 再接続を試行
					fetch(`api/session/${sessionCode}`)
						.then((response) => {
							if (response.status !== 404) {
								return response.json();
							}
							throw new Error("Session not found");
						})
						.then((data) => {
							console.log("Reconnected successfully");
							setCurrentSession(data);
							setPrevSession(data);
							connectSocket(data);
						})
						.catch((error) => {
							console.error("Reconnection failed:", error);
						});
				}
			}, 5000);
		}

		return () => clearInterval(reconnectInterval);
	}, [WorkspaceConnection, sessionCode]);

	// スクリーンショットの撮影機能
	async function takeScreenshot() {
		const element = document.body; // スクリーンショットを撮りたい要素
		const canvas = (await (html2canvas as any)(element)) as HTMLCanvasElement; // html2canvasの型定義がおかしいためanyで回避
		const imgData = canvas.toDataURL("image/png", 0.3); // Base64形式の画像データ
		return imgData;
	}

	function handleToggle() {
		if (isMobile) setIsMenuOpen((prev) => !prev);
	}

	useEffect(() => {
		if (blockNameFromMenu) setIsMenuOpen(true);
		if (!isMobile) setIsMenuOpen(true);
	}, [blockNameFromMenu, isMobile]);

	return (
		<TourProvider
			steps={tourSteps(isMobile)}
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
			<OnboardingComponent />
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
						className={`absolute sm:hidden w-8 h-8 top-2 left-4 flex items-center justify-center transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
					>
						<PanelRightClose />
					</button>
					{!showPopup &&
						WorkspaceConnection &&
						(isMobile ? (
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
										<Editor menuOpen={isMenuOpen} />
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
									<Editor menuOpen={isMenuOpen} />
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
						))}
				</div>
				<SessionPopup
					isPopupOpen={showPopup}
					message={statusMessage}
					messageType={messageType}
				/>
			</div>
		</TourProvider>
	);
}
