import { getSession } from "@/api/session";
import { TourProvider } from "@reactour/tour";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Editor from "@/components/common/Blockly/index.js";
import DialogueView from "@/components/features/editor/dialogue/index.js";
import { tourSteps } from "@/components/features/editor/editorTour";
import Navbar from "@/components/features/editor/navbar.js";
import { Onboarding } from "@/components/features/editor/onboarding.js";
import CreateSessionCard from "@/components/features/editor/sessionOverlay/index.js";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs.js";
import { useConfig } from "@/hooks/config.js";
import { useIsMobile } from "@/hooks/useMobile.js";
import { getSocket } from "@/libs/socket.js";
import { queryClient } from "@/main.js";
import type { Message } from "@/routes";
import {
	LanguageToStart,
	currentSessionState,
	currentTabState,
	isWorkspaceCodeRunning,
	isWorkspaceConnected,
	prevSessionState,
	socketIoInstance,
} from "@/state.js";
import type { Clicks, SessionValue, Tab } from "@/type.js";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import i18next from "i18next";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MessageCircleMore, PanelRightClose, Puzzle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type Operation, applyPatch, createPatch } from "rfc6902";
import { authClient } from "@/libs/auth-client";

const sessionQueryOptions = (sessionId: string) =>
	queryOptions({
		queryKey: ["session", sessionId],
		queryFn: () => getSession({ key: sessionId }),
	});
export const Route = createFileRoute("/$sessionId")({
	component: RouteComponent,
	beforeLoad: async ({ location }) => ({
		getSession: async () => {
			const session = await authClient.getSession();
			if (!session.data) {
				throw redirect({
					to: "/login",
					search: {
						redirect: location.href,
					},
				});
			}
			return session.data;
		},
	}),
	loader: async ({ params, context: { getSession } }) => {
		queryClient.ensureQueryData(sessionQueryOptions(params.sessionId));
		return await getSession();
	},
	errorComponent: () => {
		const session = Route.useLoaderData();
		const [message, setMessage] = useState<Message>({
			type: "error",
			message: "session.sessionNotFoundMsg",
		});
		return (
			<CreateSessionCard
				message={message}
				setMessage={setMessage}
				session={session}
			/>
		);
	},
});

function RouteComponent() {
	const { sessionId } = Route.useParams();
	const { data: session } = useSuspenseQuery(sessionQueryOptions(sessionId));
	const isMobile = useIsMobile();
	const [activeTab, setActiveTab] = useAtom(currentTabState);
	const [currentSession, setCurrentSession] = useAtom(currentSessionState);
	const [prevSession, setPrevSession] = useAtom(prevSessionState);
	const recordedClicksRef = useRef<Clicks>([]);
	const currentSessionRef = useRef<SessionValue | null>(null);
	const languageToStart = useAtomValue(LanguageToStart);

	const [WorkspaceConnection, setWorkspaceConnection] =
		useAtom(isWorkspaceConnected);
	const [socketInstance, setSocketInstance] = useAtom(socketIoInstance);
	const setIsCodeRunning = useSetAtom(isWorkspaceCodeRunning);
	const isInternalUpdateRef = useRef(true); // Manage flags with useRef

	const [isMenuOpen, setIsMenuOpen] = useState(true);
	function handleToggle() {
		if (isMobile) setIsMenuOpen((prev) => !prev);
	}
	const { t } = useTranslation();
	const { config } = useConfig();

	useEffect(() => {
		i18next.changeLanguage(languageToStart);
	}, [languageToStart]);

	useEffect(() => {
		const socket = getSocket(session.sessionId);

		console.warn("session UUID", session.sessionId);

		function onConnect() {
			setWorkspaceConnection(true);
			setSocketInstance(socket); // Save Socket instance
		}

		function onDisconnect() {
			setWorkspaceConnection(false);
			setSocketInstance(null); // Clear Socket instance
		}

		function onPushedCurrentSession(data: SessionValue) {
			isInternalUpdateRef.current = false; // Update flags based on useRef
			setCurrentSession(data);
			setPrevSession(data);
			setIsCodeRunning(data?.isVMRunning ?? false);
			isInternalUpdateRef.current = true; // Reset Flag
		}

		function onReceivedDiff(diff: Operation[]) {
			isInternalUpdateRef.current = false; // Update flags based on useRef

			// Apply the difference to currentSession
			setCurrentSession((prevSession) => {
				setPrevSession(prevSession); // Save Previous Session
				if (prevSession) {
					const updatedSession = { ...prevSession }; // Create a copy of the current session
					applyPatch(updatedSession, diff); // Apply Difference
					setIsCodeRunning(updatedSession?.isVMRunning ?? false);
					return updatedSession; // Returns updated sessions
				}
				console.error("Current session is null.");
				return prevSession;
			});

			isInternalUpdateRef.current = true; // Reset Flag
		}

		function onReceivedReplyingNotification() {
			setCurrentSession((prev) => {
				if (prev) {
					return {
						...prev,
						isReplying: true,
					};
				}
				return prev;
			});
		}

		async function onReceivedScreenshotRequest() {
			const image = await takeScreenshot();
			setCurrentSession((prev) => {
				if (prev) {
					return {
						...prev,
						screenshot: image,
						clicks: recordedClicksRef.current, // Use the latest click information
					};
				}
				return prev;
			});
		}

		setCurrentSession(session);
		setPrevSession(session);
		i18next.changeLanguage(session.language ?? "en");

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("PushCurrentSession", onPushedCurrentSession);
		socket.on("PushSessionDiff", onReceivedDiff);
		socket.on("notifyIsReplyingforSender", onReceivedReplyingNotification);
		socket.on("RequestScreenshot", onReceivedScreenshotRequest);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("PushCurrentSession", onPushedCurrentSession);
			socket.off("PushSessionDiff", onReceivedDiff);
			socket.off("notifyIsReplyingforSender", onReceivedReplyingNotification);
			socket.off("RequestScreenshot", onReceivedScreenshotRequest);
		};
	}, [
		session,
		setWorkspaceConnection,
		setSocketInstance,
		setCurrentSession,
		setPrevSession,
		setIsCodeRunning,
	]);

	// Ability to take screenshots
	async function takeScreenshot() {
		const element = document.body; // Elements you want to take screenshots of
		const canvas = await html2canvas(element); // html2canvas type definition is wrong, so workaround with any
		const imgData = canvas.toDataURL("image/png", 0.3); // Image data in Base64 format
		return imgData;
	}

	const handleClick = (event: MouseEvent) => {
		const prev = recordedClicksRef.current;
		const now = Date.now();
		const intervalMin = config?.Client_Settings.Screenshot_Interval_min ?? 1;
		const updatedClicks = prev?.filter(
			(click) => now - click.timestamp <= intervalMin * 60 * 1000,
		);

		const target = event.target as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width;
		const y = (event.clientY - rect.top) / rect.height;

		const click = {
			x: x,
			y: y,
			value: 1,
			timestamp: now,
		};

		// Add a new click and keep only the last 20 in the array
		const newClicks = [...(updatedClicks ?? []), click].slice(-20);

		// Updated with the latest click info ref.
		recordedClicksRef.current = newClicks;

		return newClicks;
	};
	window.addEventListener("click", handleClick);

	useEffect(() => {
		// Update ref each time currentSession is changed
		currentSessionRef.current = currentSession;
		if (socketInstance && currentSession) {
			// Check if there is data to be updated
			if (
				JSON.stringify(currentSession.workspace) !==
					JSON.stringify(prevSession?.workspace) ||
				JSON.stringify(currentSession.dialogue) !==
					JSON.stringify(prevSession?.dialogue) ||
				JSON.stringify(currentSession.userAudio) !==
					JSON.stringify(prevSession?.userAudio) ||
				JSON.stringify(currentSession.screenshot) !==
					JSON.stringify(prevSession?.screenshot) ||
				JSON.stringify(currentSession.clicks) !==
					JSON.stringify(prevSession?.clicks)
			) {
				setCurrentSession({
					...currentSession,
					updatedAt: new Date().toISOString(),
				});
				// Calculate session differences and use sendDataToServer
				if (prevSession && isInternalUpdateRef.current) {
					// Calculate the difference
					const diff = createPatch(prevSession, currentSession);

					// Send only if there is a difference, and update prevSession
					if (diff.length > 0) {
						socketInstance?.emit("UpdateCurrentSessionDiff", diff);

						setPrevSession(currentSession);
					}
				} else {
					// Compare with empty object if no previous session
					const diff = createPatch({}, currentSession);

					// Send difference
					socketInstance?.emit("UpdateCurrentSessionDiff", diff);
					setPrevSession(currentSession);
				}
			}
		}
	}, [currentSession, socketInstance]);
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
			<div className="max-h-svh h-svh w-svw overflow-hidden flex flex-col bg-gray-200 text-gray-800 app">
				<Navbar
					sessionId={sessionId}
					isConnected={WorkspaceConnection}
					isTutorial={currentSession?.tutorial?.isTutorial ?? false}
					tutorialProgress={currentSession?.tutorial?.progress ?? 0}
				/>
				<div className="flex-1 overflow-hidden relative">
					<button
						type="button"
						onClick={handleToggle}
						className={`absolute sm:hidden w-8 h-8 top-2 left-4 flex items-center justify-center transition-transform ${
							isMenuOpen ? "rotate-180" : ""
						}`}
					>
						<PanelRightClose />
					</button>
					{isMobile ? (
						<Tabs
							defaultValue="workspaceTab"
							value={activeTab}
							onValueChange={(value) => setActiveTab(value as Tab)}
							className="w-full h-full flex flex-col"
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
								<Editor
									menuOpen={isMenuOpen}
									language={session.language ?? "en"}
								/>
							</TabsContent>
							<TabsContent value="dialogueTab">
								<DialogueView />
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
								<Editor
									menuOpen={isMenuOpen}
									language={session.language ?? "en"}
								/>
							</Panel>
							<PanelResizeHandle className="h-full group w-3 transition bg-gray-400 hover:bg-gray-500 active:bg-sky-600 flex flex-col justify-center items-center gap-1">
								<div className="py-2 px-1 z-50 flex flex-col gap-1">
									<span className="rounded-full p-1  bg-gray-200 group-hover:bg-gray-100 group-active:bg-sky-300" />
									<span className="rounded-full p-1  bg-gray-200 group-hover:bg-gray-100 group-active:bg-sky-300" />
									<span className="rounded-full p-1  bg-gray-200 group-hover:bg-gray-100 group-active:bg-sky-300" />
								</div>
							</PanelResizeHandle>
							<Panel
								id="dialogueArea"
								defaultSize={25}
								order={2}
								maxSize={80}
								minSize={20}
							>
								<DialogueView />
							</Panel>
						</PanelGroup>
					)}
				</div>
			</div>
		</TourProvider>
	);
}
