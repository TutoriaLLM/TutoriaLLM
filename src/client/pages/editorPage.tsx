import Navbar from "../components/Navbar";
import Editor from "../components/Editor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Dialogue from "../components/dialogue";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import SessionPopup from "../components/session";
import { SessionValue, WSMessage } from "../../type";

//stateの読み込み
import {
  userSessionCode,
  isPopupOpen,
  currentSessionState,
  isWorkspaceConnected,
  websocketInstance,
  isWorkspaceCodeRunning,
  prevSessionState,
} from "../state";

export default function EditorPage(props: any) {
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

  var devicewidth = window.innerWidth;
  const isMobile = devicewidth < 768;
  const direction = isMobile ? "vertical" : "horizontal";

  const [statusMessage, setStatusMessage] = useState("");

  // URLパスにコードがあるか確認する
  useEffect(() => {
    console.log("useEffect");
    // URLにコードがある場合は状態を更新
    if (codeFromPath) {
      setSessionCode(codeFromPath);
      console.log("codeFromPath", codeFromPath);
    } else {
      setStatusMessage("Type your code or create a new session to start.");
      setShowPopup(true);
      console.log("codeFromPath is empty");
    }
  }, [codeFromPath]);

  // セッションが存在するか確認する。一回目だけDBから取得し、以降はWebSocketで更新する
  useEffect(() => {
    async function checkSession() {
      if (sessionCode !== "") {
        const response = await fetch("/session/" + sessionCode);
        if (response.status === 404) {
          // セッションが存在しない場合はスキップする
          console.log("code is invalid!");
          setStatusMessage(
            "Session not found. Type another code or create a new session to start."
          );
          setShowPopup(true);
        } else {
          const data: SessionValue = await response.json();
          console.log("code is valid!" + JSON.stringify(data));
          setCurrentSession(data);
          setPrevSession(data);
          connectWebSocket(data);
        }
      }
    }

    if (sessionCode !== "") {
      checkSession();
    }
  }, [sessionCode]);

  // WebSocketに接続する関数
  async function connectWebSocket(data: SessionValue) {
    const host = `ws://${window.location.host}/session/ws/connect/${sessionCode}?uuid=${data.uuid}`;

    console.log("processing websocket connection: " + host);

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
          currentSession
        );
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
          fetch("/session/" + sessionCode)
            .then((response) => {
              if (response.status !== 404) {
                return response.json();
              } else {
                throw new Error("Session not found");
              }
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
      <Navbar code={sessionCode} isConnected={WorkspaceConnection} />
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
          <PanelResizeHandle className="md:h-full md:w-3 h-3 w-full transition bg-gray-400 hover:bg-gray-500 active:bg-sky-600 flex md:flex-col justify-center items-center gap-1">
            <span className="rounded-full p-1 bg-gray-50"></span>
            <span className="rounded-full p-1 bg-gray-50"></span>
            <span className="rounded-full p-1 bg-gray-50"></span>
          </PanelResizeHandle>
          <Panel
            id="dialogueArea"
            defaultSize={25}
            order={2}
            maxSize={80}
            minSize={20}
          >
            <Dialogue />
          </Panel>
        </PanelGroup>
      )}
      <SessionPopup message={statusMessage} />
    </div>
  );
}
