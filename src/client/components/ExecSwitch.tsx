import * as Switch from "@radix-ui/react-switch";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

import {
  isWorkspaceConnected,
  websocketInstance,
  currentSessionState,
  isWorkspaceCodeRunning,
} from "../state";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { SessionValue, WSMessage } from "../../type";
import sleep from "../utils/sleep";

import { useTranslation } from "react-i18next";

//このスイッチでコードを実行するかどうかを切り替える。親コンポーネントに依存せずに動作するようにする。
export function ExecSwitch() {
  const { t } = useTranslation();
  const isCodeRunning = useAtomValue(isWorkspaceCodeRunning);
  const isConnected = useAtomValue(isWorkspaceConnected);
  const wsInstance = useAtomValue(websocketInstance);
  const currentSession = useAtomValue(currentSessionState);

  //スイッチの無効化を管理
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(true);

  //チェックの有無は、確実に状態を表示するため、コンポーネント側で状態を用意せず、サーバーの状態を元に表示する。
  function WSreq(request: string, value?: string): WSMessage | undefined {
    if (!currentSession) {
      return;
    }
    return {
      request: request,
      value: value,
    };
  }

  function ChangeSwitch() {
    if (!isConnected || !wsInstance || !currentSession) {
      console.log("An error occurred. Please try again later.");
      return;
    }

    if (isSwitchDisabled) {
      console.log("Switch is disabled.");
      return;
    }

    //スイッチが変更されたときの処理を書く
    if (isCodeRunning) {
      //スイッチがオンのとき
      console.log("stop");
      //スクリプトの実行を停止する処理を書く
      wsInstance.send(JSON.stringify(WSreq("stop")));
    }
    if (!isCodeRunning) {
      //スイッチがオフのとき
      console.log("start");
      //スクリプトの実行を開始する処理を書く
      //BlocklyワークスペースをJavaScriptコードに変換する処理を書く
      const workspace = Blockly.getMainWorkspace();
      Blockly.serialization.workspaces.load(
        currentSession.workspace,
        workspace
      );
      var generatedCode = javascriptGenerator.workspaceToCode(workspace);
      console.log("code has generated!", generatedCode.toString());
      wsInstance.send(JSON.stringify(WSreq("open", generatedCode)));
    }
    setIsSwitchDisabled(true);
  }
  //スイッチの状態が外部から変更されるまで待つ
  useEffect(() => {
    sleep(1000).then(() => {
      setIsSwitchDisabled(false);
    });
  }, [isCodeRunning, currentSession?.workspace]);
  return (
    <form className="justify-center items-center">
      {isConnected ? (
        <div className="flex items-center p-2 gap-2 rounded-2xl border border-gray-300">
          <span className="flex flex-col">
            <label className="text-gray-600 text-base leading-none font-semibold">
              {t("execSwitch.label")}
            </label>
            <label
              className={`${
                isCodeRunning ? "text-green-600" : "text-red-400"
              } text-xs leading-none font-semibold`}
            >
              {isCodeRunning
                ? t("execSwitch.Running")
                : t("execSwitch.Stopped")}
            </label>
          </span>
          <Switch.Root
            checked={isCodeRunning}
            disabled={isSwitchDisabled}
            onCheckedChange={() => ChangeSwitch()}
            className="w-16 h-10 rounded-2xl bg-gray-300 relative data-[state=checked]:bg-green-100"
          >
            <Switch.Thumb className="block w-8 h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
          </Switch.Root>
        </div>
      ) : null}
    </form>
  );
}

export default ExecSwitch;
