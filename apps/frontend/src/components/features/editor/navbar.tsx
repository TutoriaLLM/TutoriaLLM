import { ExitButton } from "@/components/common/exitButton.js";
import ExecSwitch from "@/components/features/editor/ExecSwitch";
import { Button } from "@/components/ui/button";
import * as Progress from "@radix-ui/react-progress";
import { useTour } from "@reactour/tour";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RenameSession } from "./renameSession";
import type { Socket } from "socket.io-client";

export default function Navbar({
	sessionId,
	sessionName,
	currentWorkspace,
	isCodeRunning,
	socket,
	isConnected,
	isTutorial,
	tutorialProgress,
}: {
	sessionId: string;
	sessionName: string | null;
	currentWorkspace: { [x: string]: any } | null;
	isCodeRunning: boolean;
	socket: Socket | null;
	isConnected: boolean;
	isTutorial: boolean;
	tutorialProgress: number | null | undefined;
}) {
	const { t } = useTranslation();
	const router = useRouter();
	const { queryClient } = useRouteContext({
		from: "__root__",
	});

	function handleExit() {
		socket?.disconnect();
		queryClient.invalidateQueries({
			queryKey: ["userSessions"],
			refetchType: "all",
		});
		router.navigate({ to: "/" });
	}
	// Save data to local storage when possible
	const { setIsOpen } = useTour(); // Hooks to manage tour start/end

	return (
		<div className="navbar flex-col md:flex-row justify-center shrink w-full p-2 md:p-4 bg-accent border-b-2  text-accent-foreground z-50 flex gap-2">
			<div className="flex flex-row justify-between items-center gap-4">
				{isConnected ? (
					<ExitButton text={t("navbar.saveAndLeave")} onClick={handleExit} />
				) : null}

				<div className="flex text-nowrap justify-center items-center gap-2">
					<RenameSession name={sessionName} id={sessionId} />
				</div>
			</div>
			<hr className="border h-full" />
			<div
				className={`flex flex-row gap-2 justify-between items-center${isConnected ? " w-full" : ""}`}
			>
				<span className="text-xs flex w-fit h-fit">
					{isTutorial && typeof tutorialProgress === "number" ? (
						<div className="p-2">
							<Progress.Root
								max={100}
								value={tutorialProgress}
								className="rounded-full bg-background w-32 h-3 overflow-hidden"
							>
								<Progress.Indicator
									className="bg-secondary rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
									style={{
										transform: `translateX(-${100 - tutorialProgress}%)`,
									}}
								/>
							</Progress.Root>
							<p className="text-base">{tutorialProgress}%</p>
						</div>
					) : (
						<p className="p-2 rounded-lg bg-warning-foreground w-full line-clamp-2">
							{isConnected ? t("navbar.noTutorial") : t("navbar.reconnecting")}
						</p>
					)}
				</span>
				{isConnected ? (
					<span className="flex gap-1.5 justify-center items-center">
						<Button
							type="button"
							size="icon"
							variant="outline"
							onClick={() => setIsOpen(true)} // Start Tour
						>
							<HelpCircle className="group-hover:text" />
						</Button>
						<ExecSwitch
							workspace={currentWorkspace}
							socket={socket}
							isCodeRunning={isCodeRunning}
							isConnected={isConnected}
						/>
					</span>
				) : null}
			</div>
		</div>
	);
}
