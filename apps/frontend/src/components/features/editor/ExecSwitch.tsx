import * as Switch from "@radix-ui/react-switch";

import sleep from "@/utils/sleep.js";
import { useEffect, useState } from "react";

import { PlayIcon, RefreshCcw, StopCircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import type { Socket } from "socket.io-client";
// This switch toggles whether the code is executed or not. It should work independently of the parent component.
export function ExecSwitch({
	socket,
	isCodeRunning,
	isConnected,
	workspace,
}: {
	socket: Socket | null;
	isCodeRunning: boolean;
	isConnected: boolean;
	workspace: { [x: string]: any } | null;
}) {
	const { t } = useTranslation();

	// Manage switch deactivation
	const [isSwitchDisabled, setIsSwitchDisabled] = useState(true);

	// Manage changes to running workspace content
	const [runningWorkspaceContent, setRunningWorkspaceContent] = useState("");

	// Status of the reload button
	type reloadButtonStatusType = "idle" | "reloading" | "disabled";
	const [reloadButtonStatus, setReloadButtonStatus] =
		useState<reloadButtonStatusType>("disabled");

	function ChangeSwitch() {
		if (!(isConnected && socket && workspace)) {
			return;
		}

		if (isSwitchDisabled) {
			return;
		}

		// Write the process when the switch is changed.
		if (isCodeRunning) {
			// When the switch is on
			socket.emit("stopVM");
			setReloadButtonStatus("disabled");
		}
		if (!isCodeRunning) {
			// When the switch is off
			socket.emit("openVM");
			setRunningWorkspaceContent(JSON.stringify(workspace));
		}
		setIsSwitchDisabled(true);
	}
	// Send a new code when you press the reload button
	function updateCode() {
		if (reloadButtonStatus === "reloading") {
			// Ignore clicks if reloading
			return;
		}

		if (isCodeRunning && socket && workspace) {
			setReloadButtonStatus("reloading");

			// Maintain reloading state for 1 second
			setTimeout(() => {
				// Add timeout processing (e.g., 5 seconds)
				const timeout = setTimeout(() => {
					setReloadButtonStatus("disabled");
				}, 5000);

				socket.emit("updateVM", (response: string) => {
					clearTimeout(timeout); // Clear Timeout

					if (response === "ok") {
						setReloadButtonStatus("disabled");
					} else {
						// Disable the button when an error occurs (to prevent errors, users respond with a server shutdown process)
						console.error("Error occurred while updating VM:", response);
						setReloadButtonStatus("disabled");
					}
				});
			}, 1000); // Wait for 1 second
		}
	}
	// Determine whether to enable the reload button when changing workspace
	useEffect(() => {
		const newWorkspaceContent = JSON.stringify(workspace);
		if (runningWorkspaceContent !== newWorkspaceContent && isCodeRunning) {
			setReloadButtonStatus("idle");
		}
		// Update workspace content
		setRunningWorkspaceContent(newWorkspaceContent);
	}, [workspace, runningWorkspaceContent]);

	// Wait until the switch state is changed externally
	useEffect(() => {
		sleep(1000).then(() => {
			setIsSwitchDisabled(false);
		});
	}, [isCodeRunning, workspace]);

	return (
		<form className="flex justify-center items-center execSwitch">
			{isConnected ? (
				<div className="flex items-center sm:p-2 gap-2 rounded-2xl sm:border border-gray-300">
					<span className="flex flex-col">
						<span
							className={`${
								isCodeRunning ? "text-secondary" : "text-destructive"
							} text-base leading-none font-semibold`}
						>
							{isCodeRunning ? <PlayIcon /> : <StopCircleIcon />}
						</span>
					</span>
					<span
						className={`${
							isCodeRunning
								? "text-secondary animate-pulse"
								: "text-destructive"
						} text-xs leading-none font-semibold hidden sm:block text-nowrap`}
					>
						{isCodeRunning ? t("execSwitch.Running") : t("execSwitch.Stopped")}
					</span>
					<Switch.Root
						role="switch"
						checked={isCodeRunning}
						disabled={isSwitchDisabled}
						onCheckedChange={ChangeSwitch}
						className="w-14 h-8 md:w-16 md:h-10 flex-shrink-0 rounded-2xl border bg-muted relative data-[state=checked]:bg-green-100 group"
					>
						<Switch.Thumb className="shadow block w-6 h-6 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-secondary bg-destructive data-[disabled]:bg-warning" />
						<p className="group-hover:flex hidden absolute text-xs bg-muted p-2 rounded-2xl text-black left-1/2 -translate-x-1/2 top-12 z-10 w-fit text-nowrap  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							{t("navbar.execSwitch")}
						</p>
					</Switch.Root>

					<div className="group relative">
						<Button
							className={cn(
								"sync relative rounded-2xl underline transition-colors duration-300",
								{
									"cursor-pointer text-secondary border-secondary":
										reloadButtonStatus === "idle",
								},
							)}
							type="button"
							variant="outline"
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
						</Button>
						<p className="group-hover:visible invisible absolute text-xs bg-background p-2 rounded-2xl text-foreground left-1/2 -translate-x-1/2 top-12 z-10 w-fit text-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							{t("navbar.reload")}
						</p>
					</div>
				</div>
			) : null}
		</form>
	);
}

export default ExecSwitch;
