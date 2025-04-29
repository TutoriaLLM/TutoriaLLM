import { getSession } from "@/api/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import CreateSessionCard from "@/components/features/editor/sessionOverlay/index.js";
import { useConfig } from "@/hooks/config.js";
import { useIsMobile } from "@/hooks/useMobile.js";
import { getSocket } from "@/libs/socket.js";
import type { Message } from "@/routes";
import type { Clicks, SessionValue } from "@/type.js";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import i18next from "i18next";
import { useEffect, useRef, useState } from "react";
import { type Operation, applyPatch, createPatch } from "rfc6902";
import { authClient } from "@/libs/auth-client";
import type { Socket } from "socket.io-client";
import { CodeEditor } from "@/components/features/editor";

const sessionQueryOptions = (sessionId: string) =>
	queryOptions({
		queryKey: ["session", sessionId],
		queryFn: () => getSession({ key: sessionId }),
		staleTime: 0,
		refetchOnWindowFocus: false,
	});
export const Route = createFileRoute("/$sessionId")({
	component: RouteComponent,
	beforeLoad: async ({ location, params, context: { queryClient } }) => ({
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
		getAppSession: async () => {
			const data = await queryClient.ensureQueryData(
				sessionQueryOptions(params.sessionId),
			);
			return data;
		},
	}),
	shouldReload: true,
	loader: async ({ context: { getSession, queryClient }, params }) => {
		const authSession = await getSession();
		queryClient.ensureQueryData(sessionQueryOptions(params.sessionId));
		return { authSession };
	},
	errorComponent: () => {
		const { authSession } = Route.useLoaderData();
		const [message, setMessage] = useState<Message>({
			type: "error",
			message: "session.sessionNotFoundMsg",
		});
		return (
			<CreateSessionCard
				message={message}
				setMessage={setMessage}
				session={authSession}
			/>
		);
	},
});

function RouteComponent() {
	const { sessionId } = Route.useParams();
	const { data: appSession } = useSuspenseQuery(sessionQueryOptions(sessionId));

	const isMobile = useIsMobile();
	const [currentSession, setCurrentSession] = useState<SessionValue | null>(
		appSession,
	);
	const [prevSession, setPrevSession] = useState<SessionValue | null>(
		appSession,
	);
	const recordedClicksRef = useRef<Clicks>([]);
	const currentSessionRef = useRef<SessionValue | null>(null);

	const [isWorkspaceConnected, setIsWorkspaceConnected] = useState(false);
	const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
	const isInternalUpdateRef = useRef(true); // Manage flags with useRef

	const { config } = useConfig();

	useEffect(() => {
		const socket = getSocket(appSession.sessionId);
		socket.connect();

		function onConnect() {
			setIsWorkspaceConnected(true);
			setSocketInstance(socket); // Save Socket instance
		}

		function onDisconnect() {
			setIsWorkspaceConnected(false);
			setSocketInstance(null); // Clear Socket instance
		}

		function onPushedCurrentSession(data: SessionValue) {
			isInternalUpdateRef.current = false; // Update flags based on useRef
			setCurrentSession(data);
			setPrevSession(data);

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

		setCurrentSession(appSession);
		setPrevSession(appSession);
		i18next.changeLanguage(appSession.language ?? "en");

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
			socket.disconnect();
		};
	}, [sessionId, appSession]);

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
		if (socketInstance && currentSession && prevSession) {
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
	}, [currentSession, socketInstance, prevSession]);
	return (
		<div>
			<CodeEditor
				sessionId={sessionId}
				isMobile={isMobile}
				currentSession={currentSession}
				setCurrentSession={setCurrentSession}
				isWorkspaceConnected={isWorkspaceConnected}
				socketInstance={socketInstance}
			/>
		</div>
	);
}
