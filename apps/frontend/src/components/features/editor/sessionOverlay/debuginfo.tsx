import { Button } from "@/components/ui/button";
import { deleteDB } from "idb";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
	// State that maintains the installation status of the PWA
	const [isPWAInstalled, setIsPWAInstalled] = useState<boolean>(false);
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null); // State to hold the installation prompt

	const { t } = useTranslation();

	useEffect(() => {
		// Check PWA installation status
		if (window.matchMedia("(display-mode: standalone)").matches) {
			setIsPWAInstalled(true);
		} else {
			setIsPWAInstalled(false);
		}

		// Monitor beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
			e.preventDefault(); // Prevent default prompts
			setDeferredPrompt(e); // Save Event
		};

		window.addEventListener(
			"beforeinstallprompt",
			handleBeforeInstallPrompt as EventListener,
		);

		// Cleanup Event Listener
		return () =>
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt as EventListener,
			);
	}, []);

	// Processing when the install button is clicked
	const handleInstallClick = () => {
		if (deferredPrompt) {
			deferredPrompt.prompt(); // Show installation prompt
			deferredPrompt.userChoice.then(() => {
				setDeferredPrompt(null); // Clear when finished using prompts.
			});
		}
	};

	// Delete local storage (indexedDB)
	const handleDeleteStorageClick = () => {
		deleteDB("app-data"); // Delete indexedDB
		window.localStorage.clear(); // Delete localStorage
		window.sessionStorage.clear(); // Delete sessionStorage
		window.location.reload(); // Reload page
	};

	return (
		<Dialog>
			<div className="w-full">
				<DialogTrigger asChild={true}>
					<Button size="sm" variant="transparent" className="mx-auto">
						{" "}
						{t("session.about")}
					</Button>
				</DialogTrigger>
			</div>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("session.about")}</DialogTitle>
					<VisuallyHidden>
						<DialogDescription>
							Information and debugging tools
						</DialogDescription>
					</VisuallyHidden>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<p className="text-sm">{t("session.aboutText")}</p>
					<h2 className="text-base font-bold text-gray-700">
						{t("session.debuginfo")}
					</h2>
					<div className="flex flex-col gap-2 text-xs">
						<p>Default Language : {navigator.language}</p>
						<p>PWA Status: {isPWAInstalled ? "Installed" : "Not Installed"}</p>
						{/* install button */}
						{!isPWAInstalled && deferredPrompt && (
							<Button type="button" onClick={() => handleInstallClick()}>
								{t("session.installPWA")}
							</Button>
						)}
						<Button
							type="button"
							variant="red"
							onClick={() => handleDeleteStorageClick()}
						>
							{t("session.deleteStorage")}
						</Button>
						{/* Add other debugging information here */}
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
			</DialogContent>
		</Dialog>
	);
}
