import * as Switch from "@radix-ui/react-switch";

import {
	currentSessionState,
	isWorkspaceCodeRunning,
	isWorkspaceConnected,
	socketIoInstance,
} from "@/state.js";
import sleep from "@/utils/sleep.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

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

	//実行中のワークスペース内容の変更を管理
	const [runningWorkspaceContent, setRunningWorkspaceContent] = useState("");

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
			setRunningWorkspaceContent(JSON.stringify(currentSession.workspace));
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
						setReloadButtonStatus("disabled");
					} else {
						// エラーが起きた際はボタンを無効化する（エラーを防ぐため、ユーザーはサーバーの停止処理で対応する）
						console.error("Error occurred while updating VM:", response);
						setReloadButtonStatus("disabled");
					}
				});
			}, 1000); // 1秒間待機する
		}
	}
	//ワークスペース変更時にリロードボタンを有効化するかどうかを判定する
	useEffect(() => {
		const newWorkspaceContent = JSON.stringify(currentSession?.workspace);
		if (runningWorkspaceContent !== newWorkspaceContent && isCodeRunning) {
			console.log("Workspace content has changed.");
			setReloadButtonStatus("idle");
		}
		// ワークスペースの内容を更新
		setRunningWorkspaceContent(newWorkspaceContent);
	}, [currentSession?.workspace, runningWorkspaceContent]);

	//スイッチの状態が外部から変更されるまで待つ
	useEffect(() => {
		sleep(1000).then(() => {
			setIsSwitchDisabled(false);
		});
	}, [isCodeRunning, currentSession?.workspace]);

	return (
		<form className="flex justify-center items-center execSwitch">
			{isConnected ? (
				<div className="flex items-center sm:p-2 gap-2 rounded-2xl sm:border border-gray-300">
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
						} text-xs leading-none font-semibold hidden sm:block`}
					>
						{isCodeRunning ? t("execSwitch.Running") : t("execSwitch.Stopped")}
					</span>
					<Switch.Root
						checked={isCodeRunning}
						disabled={isSwitchDisabled}
						onCheckedChange={ChangeSwitch}
						className="w-14 h-8 md:w-16 md:h-10 rounded-2xl bg-gray-300 relative data-[state=checked]:bg-green-100 group"
					>
						<Switch.Thumb className="shadow block w-6 h-6 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-green-500 bg-red-500 data-[disabled]:bg-amber-500" />
						<p className="group-hover:flex hidden absolute text-xs bg-gray-300 p-2 rounded-2xl text-black left-1/2 -translate-x-1/2 top-12 z-10 w-fit text-nowrap  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							{t("navbar.execSwitch")}
						</p>
					</Switch.Root>

					<div className="group relative">
						<button
							className={`text-xs sync bg-gray-300 relative rounded-2xl p-1.5 md:p-2 underline transition-colors duration-300 ${reloadButtonStatus === "disabled" ? "cursor-not-allowed text-gray-400 bg-gray-300" : reloadButtonStatus === "reloading" ? "cursor-wait bg-gray-300" : "cursor-pointer bg-green-500 text-green-200"}`}
							type="button"
							onClick={updateCode}
							disabled={
								reloadButtonStatus === "disabled" ||
								reloadButtonStatus === "reloading"
							}
							aria-label={t("navbar.reload")}
						>
							<RefreshCcw
								className={
									reloadButtonStatus === "reloading"
										? "animate-spin ease-in-out"
										: ""
								}
							/>
						</button>
						<p className="group-hover:visible invisible absolute text-xs bg-gray-300 p-2 rounded-2xl text-black left-1/2 -translate-x-1/2 top-12 z-10 w-fit text-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							{t("navbar.reload")}
						</p>
					</div>
				</div>
			) : null}
		</form>
	);
}

export default ExecSwitch;
