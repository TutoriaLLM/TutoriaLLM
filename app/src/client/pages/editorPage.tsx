import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";
import type { AppConfig, SessionValue, WSMessage } from "../../type";
import Editor from "../components/BlocklyEditor/Blockly";
import Navbar from "../components/BlocklyEditor/Navbar";

//言語の読み込み
import { useTranslation } from "react-i18next";

import i18next from "i18next";
import DialogueView from "../components/BlocklyEditor/dialogue";
import SessionPopup from "../components/BlocklyEditor/sessionOverlay";
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
	websocketInstance,
} from "../state";

export default function EditorPage() {
	const { code: codeFromPath } = useParams();
	const [sessionCode, setSessionCode] = useAtom(userSessionCode);
	// 現在のセッション情報
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	//比較するために前回の値を保存
	const [prevSession, setPrevSession] = useAtom(prevSessionState);

	const [showPopup, setShowPopup] = useAtom(isPopupOpen);
	const [WorkspaceConnection, setWorkspaceConnection] =
		useAtom(isWorkspaceConnected);
	const [wsInstance, setWsInstance] = useAtom(websocketInstance);
	const setIsCodeRunning = useSetAtom(isWorkspaceCodeRunning);

	//設定の保存をするstatte
	const [settings, setSettings] = useAtom(settingState);

	const devicewidth = window.innerWidth;
	const isMobile = devicewidth < 768;
	const direction = isMobile ? "vertical" : "horizontal";

	//言語
	const { t } = useTranslation();
	const languageToStart = useAtomValue(LanguageToStart);

	const [statusMessage, setStatusMessage] = useState(t("session.typecodeMsg"));
	const timerRef = useRef<NodeJS.Timeout | null>(null); // タイマーを保持するためのref

	//設定をAPIから取得
	useEffect(() => {
		async function fetchConfig() {
			const result = await fetch("api/config");
			const response = (await result.json()) as AppConfig;
			if (!response) {
				throw new Error("Failed to fetch config");
			}
			setSettings(response);
		}
		try {
			fetchConfig();
			console.log("fetching settings...");
		} catch (error) {
			console.error("Error fetching settings:", error);
		}
	}, []);

	// URLパスにコードがあるか確認する
	useEffect(() => {
		console.log("useEffect");
		//言語に応じたメッセージを表示
		setStatusMessage(t("session.typecodeMsg"));
		// URLにコードがある場合は状態を更新
		if (codeFromPath) {
			setSessionCode(codeFromPath);
			console.log("codeFromPath", codeFromPath);
		} else {
			setShowPopup(true);
			console.log("codeFromPath is empty");
		}
	}, [codeFromPath, languageToStart]);

	// セッションが存在するか確認する。一回目だけDBから取得し、以降はWebSocketで更新する
	useEffect(() => {
		async function checkSession() {
			if (sessionCode !== "") {
				const response = await fetch(`api/session/${sessionCode}`);
				if (response.status === 404) {
					// セッションが存在しない場合はスキップする
					console.log("code is invalid!");
					setStatusMessage(t("session.sessionNotFoundMsg"));
					setShowPopup(true);
				} else {
					const data: SessionValue = await response.json();
					console.log(`code is valid!${JSON.stringify(data)}`);
					setCurrentSession(data);
					setPrevSession(data);
					connectWebSocket(data);
					i18next.changeLanguage(data.language);
				}
			}
		}

		if (sessionCode !== "") {
			checkSession();
		}
	}, [sessionCode, languageToStart]);

	// WebSocketに接続する関数
	async function connectWebSocket(data: SessionValue) {
		// プロトコルを取得
		const protocol = window.location.protocol === "https:" ? "wss" : "ws";
		const host = `${protocol}://${window.location.host}/api/session/ws/connect/${sessionCode}?uuid=${data.uuid}&language=${data.language}`;

		console.log(`processing websocket connection: ${host}`);

		const ws = new WebSocket(host);
		ws.onopen = () => {
			console.log("connected");
			setWorkspaceConnection(true);
			setWsInstance(ws); // WebSocketインスタンスを保存
		};
		ws.onmessage = (event) => {
			const message = event.data;
			const messageJson: WSMessage | SessionValue = JSON.parse(message);
			console.log("Message from server ", messageJson);
			//コードの実行状況
			if ((messageJson as WSMessage).request === "updateState_isrunning") {
				console.log("isrunning updated");
				setIsCodeRunning((messageJson as WSMessage).value as boolean);
			}
			//pingを受信したらpongを返す
			if ((messageJson as WSMessage).request === "ping") {
				console.log("Received ping from server");
				ws.send(JSON.stringify({ request: "pong" } as WSMessage));
			}
			//セッション内容を受信したらワークスペース内容をprevSessionと比較して内容が違う場合は更新する
			if ((messageJson as SessionValue).workspace !== prevSession?.workspace) {
				console.log("Received changed session data from server!");
				setCurrentSession(messageJson as SessionValue);
			}
		};
		ws.onclose = () => {
			console.log("disconnected");
			setWorkspaceConnection(false);
			setWsInstance(null); // WebSocketインスタンスをクリア
		};
	}

	// currentSessionが変更されたら、内容をprevSessionと比較して内容が違う場合はWebSocketに送信する
	useEffect(() => {
		if (
			wsInstance &&
			wsInstance.readyState === WebSocket.OPEN &&
			currentSession
		) {
			// 前回のセッションのワークスペース、対話の内容が違う場合のみ送信
			if (
				JSON.stringify(currentSession.workspace) !==
					JSON.stringify(prevSession?.workspace) ||
				JSON.stringify(currentSession.dialogue) !==
					JSON.stringify(prevSession?.dialogue)
			) {
				wsInstance.send(JSON.stringify(currentSession));
				setPrevSession(currentSession);
				console.log(
					"Sent currentSession to WebSocket and save prev session:",
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
	}, [currentSession, wsInstance]);

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
							connectWebSocket(data);
						})
						.catch((error) => {
							console.error("Reconnection failed:", error);
						});
				}
			}, 5000);
		}

		return () => clearInterval(reconnectInterval);
	}, [WorkspaceConnection, sessionCode]);

	return (
		<div className="w-screen h-screen flex flex-col bg-gray-200 text-gray-800">
			<Navbar
				code={sessionCode}
				isConnected={WorkspaceConnection}
				isTutorial={currentSession?.tutorial?.isTutorial ?? false}
				tutorialProgress={currentSession?.tutorial?.progress ?? 0}
			/>
			{!showPopup && WorkspaceConnection && (
				// ポップアップが表示されている場合や接続が確立されていない場合はエディタを表示しない
				<PanelGroup autoSaveId="workspace" direction={direction}>
					<Panel
						id="workspaceArea"
						defaultSize={75}
						order={1}
						maxSize={80}
						minSize={20}
					>
						<Editor />
					</Panel>
					<PanelResizeHandle className="md:h-full md:w-3 h-5 w-full transition bg-gray-400 hover:bg-gray-500 active:bg-sky-600 flex md:flex-col justify-center items-center gap-1">
						<span className="rounded-full p-1 bg-gray-50" />
						<span className="rounded-full p-1 bg-gray-50" />
						<span className="rounded-full p-1 bg-gray-50" />
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
			<SessionPopup isPopupOpen={showPopup} message={statusMessage} />
		</div>
	);
}
