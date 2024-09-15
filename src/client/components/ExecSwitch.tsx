import * as Switch from "@radix-ui/react-switch";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import sleep from "../../utils/sleep.js";
import {
	currentSessionState,
	isWorkspaceCodeRunning,
	isWorkspaceConnected,
	socketIoInstance,
} from "../state.js";

import { PlayIcon, RefreshCcw, StopCircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
//このスイッチでコードを実行するかどうかを切り替える。親コンポーネントに依存せずに動作するようにする。
export function ExecSwitch() {
	const { t } = useTranslation();
	const isCodeRunning = useAtomValue(isWorkspaceCodeRunning);
	const isConnected = useAtomValue(isWorkspaceConnected);
	const socketInstance = useAtomValue(socketIoInstance);
	const currentSession = useAtomValue(currentSessionState);

	//スイッチの無効化を管理
	const [isSwitchDisabled, setIsSwitchDisabled] = useState(true);

	//再読み込みボタンのステータス
	type reloadButtonStatusType = "idle" | "reloading" | "disabled";
	const [reloadButtonStatus, setReloadButtonStatus] =
		useState<reloadButtonStatusType>("disabled");

	function ChangeSwitch() {
		if (!isConnected || !socketInstance || !currentSession) {
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
			socketInstance.emit("stopVM");
			setReloadButtonStatus("disabled");
		}
		if (!isCodeRunning) {
			//スイッチがオフのとき
			console.log("start");
			socketInstance.emit("openVM");
			setReloadButtonStatus("idle");
		}
		setIsSwitchDisabled(true);
	}
	// リロードボタンを押した時に、新しいコードを送信する
	function updateCode() {
		if (reloadButtonStatus === "reloading") {
			// reloading の場合、クリックを無視する
			return;
		}

		if (isCodeRunning && socketInstance && currentSession) {
			setReloadButtonStatus("reloading");

			// 1秒間 reloading 状態を維持する
			setTimeout(() => {
				// タイムアウト処理を追加（例えば5秒）
				const timeout = setTimeout(() => {
					setReloadButtonStatus("disabled");
					console.log("Timeout occurred, reloading failed.");
				}, 5000);

				socketInstance.emit("updateVM", (response: string) => {
					clearTimeout(timeout); // タイムアウトのクリア

					if (response === "ok") {
						setReloadButtonStatus("idle");
					} else {
						// エラーが起きた際はボタンを無効化する（エラーを防ぐため、ユーザーはサーバーの停止処理で対応する）
						console.error("Error occurred while updating VM:", response);
						setReloadButtonStatus("disabled");
					}
				});
			}, 1000); // 1秒間待機する
		}
	}

	//スイッチの状態が外部から変更されるまで待つ
	useEffect(() => {
		sleep(1000).then(() => {
			setIsSwitchDisabled(false);
		});
	}, [isCodeRunning, currentSession?.workspace]);
	return (
		<form className="justify-center items-center execSwitch">
			{isConnected ? (
				<div className="flex items-center p-2 gap-2 rounded-2xl border border-gray-300">
					<span className="flex flex-col">
						<span
							className={`${
								isCodeRunning ? "text-green-600" : "text-red-400"
							} text-base leading-none font-semibold`}
						>
							{isCodeRunning ? <PlayIcon /> : <StopCircleIcon />}
						</span>
					</span>
					<span
						className={`${
							isCodeRunning ? "text-green-600 animate-pulse" : "text-red-400"
						} text-xs leading-none font-semibold hidden md:block`}
					>
						{isCodeRunning ? t("execSwitch.Running") : t("execSwitch.Stopped")}
					</span>
					<Switch.Root
						checked={isCodeRunning}
						disabled={isSwitchDisabled}
						onCheckedChange={() => ChangeSwitch()}
						className="w-10 h-6 md:w-16 md:h-10 rounded-2xl bg-gray-300 relative data-[state=checked]:bg-green-100"
					>
						<Switch.Thumb className="shadow block w-4 h-4 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
					</Switch.Root>

					<button
						className={`text-xs push bg-gray-300 relative rounded-2xl p-2 underline ${reloadButtonStatus === "disabled" ? "cursor-not-allowed text-gray-400" : reloadButtonStatus === "reloading" ? "cursor-wait " : "cursor-pointer"}`}
						type="button"
						onClick={() => updateCode()}
						disabled={
							reloadButtonStatus === "disabled" ||
							reloadButtonStatus === "reloading"
						}
					>
						<RefreshCcw
							className={
								reloadButtonStatus === "reloading" ? "animate-spin" : ""
							}
						/>
					</button>
				</div>
			) : null}
		</form>
	);
}

export default ExecSwitch;
