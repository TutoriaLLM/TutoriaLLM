import { TourProvider } from "@reactour/tour";
import {} from "@tanstack/react-router";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import DialogueView from "@/components/features/editor/dialogue/index.js";
import { tourSteps } from "@/components/features/editor/editorTour";
import Navbar from "@/components/features/editor/navbar.js";
import { Onboarding } from "@/components/features/editor/onboarding.js";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs.js";
import {
	blockNameFromMenuState,
	currentTabState,
	highlightedBlockState,
} from "@/state.js";
import type { SessionValue, Tab } from "@/type.js";
import { useAtom, useAtomValue } from "jotai";
import { MessageCircleMore, PanelRightClose, Puzzle } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import type { Socket } from "socket.io-client";
import { BlocklyEditor } from "@/components/common/Blockly";
export function CodeEditor({
	sessionId,
	isMobile,
	currentSession,
	setCurrentSession,
	isWorkspaceConnected,
	socketInstance,
}: {
	sessionId: string;
	isMobile: boolean;
	currentSession: SessionValue | null;
	setCurrentSession: Dispatch<SetStateAction<SessionValue | null>>;
	isWorkspaceConnected: boolean;
	socketInstance: Socket | null;
}) {
	const [activeTab, setActiveTab] = useAtom(currentTabState);
	const blockNameToHighlight = useAtomValue(blockNameFromMenuState);
	const highlightedBlock = useAtomValue(highlightedBlockState);
	const [isMenuOpen, setIsMenuOpen] = useState(true);
	const [workspaceJson, setWorkspaceJson] = useState<
		SessionValue["workspace"] | null
	>(currentSession?.workspace ?? null);

	useEffect(() => {
		if (
			JSON.stringify(currentSession?.workspace) !==
			JSON.stringify(workspaceJson)
		) {
			setWorkspaceJson(currentSession?.workspace ?? null);
		}
	}, [currentSession, workspaceJson]);

	const { t } = useTranslation();
	function handleToggle() {
		if (isMobile) setIsMenuOpen((prev) => !prev);
	}

	function setCurrentSessionWorkspace(newWorkspace: SessionValue["workspace"]) {
		if (currentSession) {
			setCurrentSession((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					workspace: newWorkspace,
				};
			});
		}
	}

	return (
		<TourProvider
			steps={tourSteps(isMobile)}
			disableFocusLock={true}
			className="w-64 sm:w-full font-medium text-base border"
			padding={{
				popover: [-10, 0],
			}}
			styles={{
				popover: (base) => ({
					...base,
					"--reactour-accent": "#38bdf8",
					borderRadius: 10,
					padding: "16px",
					paddingTop: "42px",
					gap: "16px",
					zIndex: 100000,
				}),
				maskArea: (base) => ({ ...base, rx: 10 }),
			}}
		>
			<Onboarding currentSession={currentSession} />
			<div className="max-h-svh h-svh w-svw overflow-hidden flex flex-col bg-background text-foreground app">
				<Navbar
					sessionId={currentSession?.sessionId ?? sessionId ?? ""}
					sessionName={currentSession?.name ?? null}
					currentWorkspace={currentSession?.workspace ?? null}
					isCodeRunning={currentSession?.isVMRunning ?? false}
					socket={socketInstance}
					isConnected={isWorkspaceConnected}
					isTutorial={currentSession?.tutorial?.isTutorial ?? false}
					tutorialProgress={currentSession?.tutorial?.progress ?? 0}
				/>
				{isWorkspaceConnected && (
					<div className="flex-1 overflow-hidden relative">
						<Button
							type="button"
							variant="secondary"
							size="icon"
							onClick={handleToggle}
							className={cn(
								"rounded-full absolute sm:hidden w-8 h-8 top-2 left-4 flex items-center justify-center transition-transform",
								{ "rotate-180": isMenuOpen },
							)}
						>
							<PanelRightClose />
						</Button>
						{isMobile ? (
							<Tabs
								defaultValue="workspaceTab"
								value={activeTab}
								onValueChange={(value) => setActiveTab(value as Tab)}
								className="w-full h-full flex flex-col bg-accent"
							>
								<TabsList>
									<TabsTrigger value="workspaceTab">
										<Puzzle className="w-4 h-4" />
										{t("editor.workspaceTab")}
									</TabsTrigger>
									<TabsTrigger value="dialogueTab">
										<MessageCircleMore className="w-4 h-4" />
										{t("editor.dialogueTab")}
									</TabsTrigger>
								</TabsList>
								<TabsContent value="workspaceTab">
									<BlocklyEditor
										isMenuOpen={isMenuOpen}
										blockNameToHighlight={blockNameToHighlight}
										blockIdToHighlight={highlightedBlock}
										language={currentSession?.language ?? "en"}
										workspaceJson={workspaceJson ?? undefined}
										setWorkspaceJson={setCurrentSessionWorkspace}
									/>
								</TabsContent>
								<TabsContent value="dialogueTab">
									<DialogueView
										session={currentSession}
										setSession={setCurrentSession}
									/>
								</TabsContent>
							</Tabs>
						) : (
							<PanelGroup autoSaveId="workspace" direction="horizontal">
								<Panel
									id="workspaceArea"
									defaultSize={75}
									order={1}
									maxSize={80}
									minSize={20}
								>
									<BlocklyEditor
										isMenuOpen={isMenuOpen}
										blockNameToHighlight={blockNameToHighlight}
										blockIdToHighlight={highlightedBlock}
										language={currentSession?.language ?? "en"}
										workspaceJson={workspaceJson ?? undefined}
										setWorkspaceJson={setCurrentSessionWorkspace}
									/>
								</Panel>
								<PanelResizeHandle className="h-full group w-3 transition bg-accent hover:bg-accent/80 active:bg-primary-foreground flex flex-col justify-center items-center gap-1">
									<div className="py-2 px-1 z-50 flex flex-col gap-1">
										<span className="rounded-full p-1  bg-accent-foreground group-hover:bg-accent-foreground/80 group-active:bg-primary" />
										<span className="rounded-full p-1  bg-accent-foreground group-hover:bg-accent-foreground/80 group-active:bg-primary" />
										<span className="rounded-full p-1  bg-accent-foreground group-hover:bg-accent-foreground/80 group-active:bg-primary" />
									</div>
								</PanelResizeHandle>
								<Panel
									id="dialogueArea"
									defaultSize={25}
									order={2}
									maxSize={80}
									minSize={20}
								>
									<DialogueView
										session={currentSession}
										setSession={setCurrentSession}
									/>
								</Panel>
							</PanelGroup>
						)}
					</div>
				)}
			</div>
		</TourProvider>
	);
}
