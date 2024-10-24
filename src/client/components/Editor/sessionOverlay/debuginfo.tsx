import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Popup from "../../ui/Popup.js";
import { deleteDB } from "idb";

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {
	/**
	 * Returns an array of DOMString items containing the platforms on which the event was dispatched.
	 * This is provided for user agents that want to present a choice of versions to the user such as,
	 * for example, "web" or "play" which would allow the user to chose between a web version or
	 * an Android version.
	 */
	readonly platforms: Array<string>;

	/**
	 * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
	 */
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;

	/**
	 * Allows a developer to show the install prompt at a time of their own choosing.
	 * This method returns a Promise.
	 */
	prompt(): Promise<void>;
}

export function DebugInfo() {
	// PWAのインストール状態を保持するステート
	const [isPWAInstalled, setIsPWAInstalled] = useState<boolean>(false);
	const [isDebugInfoOpen, setIsDebugInfoOpen] = useState<boolean>(false);
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null); // インストールプロンプトを保持するステート

	function switchDebugInfo() {
		setIsDebugInfoOpen(!isDebugInfoOpen);
	}

	const { t } = useTranslation();

	useEffect(() => {
		// PWAのインストール状況を確認する
		if (window.matchMedia("(display-mode: standalone)").matches) {
			setIsPWAInstalled(true);
		} else {
			setIsPWAInstalled(false);
		}

		// beforeinstallpromptイベントを監視する
		const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
			e.preventDefault(); // デフォルトのプロンプトを防止
			setDeferredPrompt(e); // イベントを保存
		};

		window.addEventListener(
			"beforeinstallprompt",
			handleBeforeInstallPrompt as EventListener,
		);

		// クリーンアップイベントリスナー
		return () =>
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt as EventListener,
			);
	}, []);

	// インストールボタンをクリックしたときの処理
	const handleInstallClick = () => {
		if (deferredPrompt) {
			deferredPrompt.prompt(); // インストールプロンプトを表示
			deferredPrompt.userChoice.then((choiceResult) => {
				if (choiceResult.outcome === "accepted") {
					console.log("PWA installed");
				} else {
					console.log("PWA installation dismissed");
				}
				setDeferredPrompt(null); // プロンプトの使用が終了したらクリア
			});
		}
	};

	// ローカルストレージ(indexedDB)を削除する
	const handleDeleteStorageClick = () => {
		deleteDB("app-data"); // indexedDBを削除
		window.localStorage.clear(); // localStorageを削除
		window.sessionStorage.clear(); // sessionStorageを削除
		window.location.reload(); // ページをリロード
		console.log("Local storage cleared");
	};

	return (
		<div className="h-full flex flex-col gap-2 text-xs text-gray-400">
			<button
				type="button"
				className={`p-2 rounded-xl bg-gray-200 hover:bg-gray-300 ${
					isDebugInfoOpen ? "bg-gray-300" : ""
				}`}
				onClick={switchDebugInfo}
			>
				{t("session.about")}
			</button>
			{isDebugInfoOpen ? (
				<Popup
					openState={isDebugInfoOpen}
					onClose={switchDebugInfo}
					Content={
						<div className="flex flex-col gap-4">
							<h2 className="text-2xl text-gray-700">{t("session.about")}</h2>
							<p className="">{t("session.aboutText")}</p>
							<h2 className="text-2xl text-gray-700">
								{t("session.debuginfo")}
							</h2>
							<div className="flex flex-col gap-2">
								<p>Default Language : {navigator.language}</p>
								<p>
									PWA Status: {isPWAInstalled ? "Installed" : "Not Installed"}
								</p>
								{/* インストールボタン */}
								{!isPWAInstalled && deferredPrompt && (
									<button
										type="button"
										className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
										onClick={() => handleInstallClick()}
									>
										{t("session.installPWA")}
									</button>
								)}
								<button
									type="button"
									className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
									onClick={() => handleDeleteStorageClick()}
								>
									{t("session.deleteStorage")}
								</button>
								{/* 他のデバッグ情報をここに追加する */}
							</div>
							<p className="italic font-bold">
								&#9829;Developed by So Tokumaru with many contributors. <br />
								<a
									className="text-blue-400 hover:text-blue-300 transition-colors"
									href="https://tutoriallm.com"
								>
									check tutoriallm.com for more info
								</a>
							</p>
						</div>
					}
				/>
			) : null}
		</div>
	);
}
