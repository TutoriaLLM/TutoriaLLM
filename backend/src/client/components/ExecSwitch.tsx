import * as Switch from "@radix-ui/react-switch";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import type { WSMessage } from "../../type";
import sleep from "../../utils/sleep";
import {
	currentSessionState,
	isWorkspaceCodeRunning,
	isWorkspaceConnected,
	websocketInstance,
} from "../state";

import { PlayIcon, StopCircleIcon } from "lucide-react";
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
			wsInstance.send(JSON.stringify(WSreq("open")));
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
						<label
							className={`${
								isCodeRunning ? "text-green-600" : "text-red-400"
							} text-base leading-none font-semibold`}
						>
							{isCodeRunning ? <PlayIcon /> : <StopCircleIcon />}
						</label>
					</span>
					<label
						className={`${
							isCodeRunning ? "text-green-600 animate-pulse" : "text-red-400"
						} text-xs leading-none font-semibold`}
					>
						{isCodeRunning ? t("execSwitch.Running") : t("execSwitch.Stopped")}
					</label>
					<Switch.Root
						checked={isCodeRunning}
						disabled={isSwitchDisabled}
						onCheckedChange={() => ChangeSwitch()}
						className="w-16 h-10 rounded-2xl bg-gray-300 relative data-[state=checked]:bg-green-100"
					>
						<Switch.Thumb className="shadow block w-8 h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
					</Switch.Root>
				</div>
			) : null}
		</form>
	);
}

export default ExecSwitch;
