import QuickReply from "@/components/features/editor/dialogue/parts/quickReply";
import TextBubble from "@/components/features/editor/dialogue/parts/textbubble";
import { SwitchModeUI } from "@/components/features/editor/dialogue/parts/ui/switchModeUI";
import {
	HorizontalScrollProvider,
	useHorizontalScroll,
} from "@/hooks/horizontalScroll.js";
import { updateStats } from "@/utils/statsUpdater.js";
import { Bot, Mic, Pause, Play, Send, Trash } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import WaveSurfer from "wavesurfer.js";

import { useConfig } from "@/hooks/config.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import type { SessionValue } from "@/type";

export default function DialogueView({
	session,
	setSession,
}: {
	session: SessionValue | null;
	setSession: Dispatch<SetStateAction<SessionValue | null>>;
}) {
	const { t } = useTranslation();
	const [message, setMessage] = useState("");
	const [audioURL, setAudioURL] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [remainingTime, setRemainingTime] = useState(10);
	const [isHttps, setIsHttps] = useState(false); // Manage HTTPS or not
	const parentRef = useRef<HTMLDivElement>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const wavesurferRef = useRef<WaveSurfer | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const streamRef = useRef<MediaStream | null>(null); // Manage microphone streams

	const [isSending, setIsSending] = useState(false); // Manage whether a message is being sent or not

	const { config } = useConfig();

	useEffect(() => {
		// Check if the page is served with HTTPS
		if (window.location.protocol === "https:") {
			setIsHttps(true);
		}
	}, []);

	const sendMessage = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault(); // Prevent default form submissions

			// For audio (message must be empty)
			if (
				audioURL &&
				!isSending &&
				!message &&
				config?.AI_Settings.Chat_Audio === true
			) {
				// Confirmation that the transmission is not already in progress
				setIsSending(true); // Set the sending flag
				setSession((prev) => {
					if (prev) {
						const lastId =
							(prev.dialogue?.length || 0) > 0
								? (prev.dialogue?.[prev.dialogue.length - 1]?.id ?? 0)
								: 0;
						return {
							...prev,
							dialogue: [
								...(prev.dialogue || []),
								{
									id: lastId + 1,
									contentType: "user_audio",
									isUser: true,
									content: "",
								},
							],
							stats: updateStats(
								{
									totalUserMessages: prev.stats.totalUserMessages + 1,
								},
								prev,
							).stats,
							userAudio: audioURL, // Set base64 encoded MP3 data
						};
					}
					return session;
				});
				setMessage(""); // Clear field after message is sent
				setAudioURL(""); // Clear audio URL
				setIsSending(false); // Reset the in-transmission flag after transmission is complete
			}

			// For messages
			if (message && !isSending && !audioURL) {
				// Confirmation that the transmission is not already in progress
				setIsSending(true); // Set the sending flag
				setSession((prev) => {
					if (prev) {
						const lastId =
							(prev.dialogue?.length || 0) > 0
								? (prev.dialogue?.[prev.dialogue.length - 1]?.id ?? 0)
								: 0;
						return {
							...prev,
							dialogue: [
								...(prev.dialogue || []),
								{
									id: lastId + 1,
									contentType: "user",
									isUser: true,
									content: message,
								},
							],
							stats: updateStats(
								{
									totalUserMessages: prev.stats.totalUserMessages + 1,
								},
								prev,
							).stats,
						};
					}
					return prev;
				});
				setMessage(""); // Clear field after message is sent
				setAudioURL(""); // Clear audio URL
				setIsSending(false); // Reset the in-transmission flag after transmission is complete
			}
		},
		[message, audioURL, isSending, setSession],
	);

	const handleQuickReply = useCallback((reply: string) => {
		setMessage(reply);
	}, []);

	const startRecording = () => {
		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			streamRef.current = stream; // Save Stream
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			mediaRecorder.start();

			const audioChunks: Blob[] = [];
			mediaRecorder.addEventListener("dataavailable", (event) => {
				audioChunks.push(event.data);
			});

			mediaRecorder.addEventListener("stop", () => {
				const audioBlob = new Blob(audioChunks, { type: "audio/mp3" }); // Set to MP3 format
				const reader = new FileReader();
				reader.readAsDataURL(audioBlob);
				reader.onloadend = () => {
					const base64data = reader.result as string;
					setAudioURL(base64data);
					// Check if waveform container exists
					const waveformContainer = document.querySelector("#waveform");
					if (!waveformContainer) {
						return;
					}
					// Create a new wavesurfer instance
					if (wavesurferRef.current) {
						wavesurferRef.current.destroy();
					}
					const wavesurfer = WaveSurfer.create({
						container: "#waveform",
						waveColor: "#f87171",
						progressColor: "#9ca3af",
						barWidth: 2,
						barGap: 1,
						barRadius: 10,
						height: 32,
						width: 48,
					});
					wavesurferRef.current = wavesurfer;

					wavesurfer.on("finish", () => {
						setIsPlaying(false);
					});
					wavesurfer.load(base64data);
				};
			});

			setIsRecording(true);
			setRemainingTime(10);

			intervalRef.current = setInterval(() => {
				setRemainingTime((prev) => prev - 1);
			}, 1000);
		});
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (wavesurferRef.current) {
				wavesurferRef.current.destroy();
				wavesurferRef.current = null;
			}
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop(); // Terminate microphone access
				}
				streamRef.current = null;
			}
		}
	};

	const removeAudio = () => {
		setAudioURL("");
		if (wavesurferRef.current) {
			wavesurferRef.current.destroy();
			wavesurferRef.current = null;
		}
	};

	const togglePlayPause = () => {
		if (wavesurferRef.current) {
			if (isPlaying) {
				wavesurferRef.current.pause();
			} else {
				wavesurferRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	useEffect(() => {
		if (audioURL) {
			if (!wavesurferRef.current) {
				const wavesurfer = WaveSurfer.create({
					container: "#waveform",
					waveColor: "#f87171",
					progressColor: "#9ca3af",
					barWidth: 2,
					barGap: 1,
					barRadius: 10,
					height: 32,
					width: 48,
				});
				wavesurferRef.current = wavesurfer;

				wavesurfer.on("finish", () => {
					setIsPlaying(false);
				});
			}
			wavesurferRef.current.load(audioURL);
			// Disable text messages.
			setMessage("");
		}
	}, [audioURL]);

	// Virtual Scroll Settings
	const rowVirtualizer = useVirtualizer({
		overscan: 5,
		count: session?.dialogue ? session.dialogue.length : 0,
		paddingStart: 16,
		paddingEnd: 16,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 80,
		enabled: true,
	});
	rowVirtualizer.scrollDirection = "forward"; // Enable reverse scrolling

	useEffect(() => {
		if (session?.dialogue) {
			rowVirtualizer.scrollToIndex(session.dialogue.length - 1, {});
		}
	}, [session?.dialogue]);

	//limit time of recording
	useEffect(() => {
		if (remainingTime <= 0) {
			stopRecording();
		}
	}, [remainingTime]);

	const items = rowVirtualizer.getVirtualItems();
	return (
		<div className="dialogue grow w-full h-full flex flex-col bg-background font-medium">
			<SwitchModeUI
				audio={config?.AI_Settings.Chat_Audio}
				sessionState={session}
				setSessionState={setSession}
			/>
			<div
				className="w-full h-full overflow-y-auto contain-strict"
				ref={parentRef}
			>
				<div
					className={"w-full relative"}
					style={{ height: rowVirtualizer.getTotalSize() }}
				>
					<div
						className="absolute top-0 left-0 w-full"
						style={{
							transform: `translateY(${items[0]?.start ?? 0}px)`,
						}}
					>
						{items.map((virtualRow) => {
							if (!session) return null;
							const item = session?.dialogue
								? session.dialogue[virtualRow.index]
								: null;
							if (!item) return null;
							return (
								<TextBubble
									currentSession={session}
									setCurrentSession={setSession}
									className="w-full"
									ref={(el) => {
										if (el) {
											// Call `measureElement` after the element is mounted
											rowVirtualizer.measureElement(el);
										}
									}}
									data-index={virtualRow.index}
									key={virtualRow.key}
									item={item}
									// biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
									easyMode={session?.easyMode || false}
								/>
							);
						})}
					</div>
				</div>

				{/* Show animation while replying */}
				{session?.isReplying && (
					<div className="flex px-4 py-2 justify-start items-end gap-2 animate-loading-blink">
						<div className="text-foreground flex flex-col items-center">
							<span className="p-2">
								<Bot />
							</span>
							<p className="text-xs">{t("textbubble.ai")}</p>
						</div>
						<div className="rounded-2xl rounded-bl-none bg-accent text-accent-foreground p-3 shadow max-w-sm border">
							<p className="prose bg-gradient-to-r from-gray-500 from-30% via-gray-700 via-50% to-gray-500 to-70% bg-[size:280%] bg-center flex animate-loading-flow text-transparent bg-clip-text">
								{t("textbubble.replying")}
							</p>
						</div>
					</div>
				)}
			</div>
			<div className="w-full p-2">
				<div className="items-center bg-card shadow gap-2 p-2 rounded-2xl w-full">
					{session?.quickReplies && (
						<div className="relative w-full py-2.5 overflow-clip">
							{/* Provide context with HorizontalScrollProvider */}
							<HorizontalScrollProvider>
								<QuickReplyContainer
									onReply={handleQuickReply}
									quickReplies={session?.quickReplies || null}
								/>
							</HorizontalScrollProvider>
							<div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-card to-transparent pointer-events-none" />
							<div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-card to-transparent pointer-events-none" />
						</div>
					)}

					<form className="flex w-full gap-2" onSubmit={sendMessage}>
						{config?.AI_Settings.Chat_Audio && isHttps && (
							<Button
								type="button"
								onClick={isRecording ? stopRecording : startRecording}
								className={cn(
									"w-10 h-12 md:w-12 md:h-16 shrink-0 text-background rounded-2xl flex justify-center items-center relative transition-colors bg-secondary hover:bg-secondary",
									{ "bg-destructive": isRecording },
								)}
							>
								{isRecording ? (
									<div className="flex items-center justify-center">
										<div className="relative">
											<span className="absolute inset-0 flex items-center justify-center text-xs text-destructive-foreground">
												{remainingTime}
											</span>
										</div>
									</div>
								) : (
									<Mic />
								)}
							</Button>
						)}
						<div
							className="flex flex-1 min-w-0 border shadow-inner gap-2 p-1 rounded-2xl 
             bg-background outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
						>
							{audioURL ? (
								<div
									className="flex w-full min-w-0 max-w-48 gap-2 p-1 justify-center items-center 
                       rounded-full bg-accent animate-fade-in"
								>
									<Button
										type="button"
										variant="ghost"
										className="hover:text-secondary p-2"
										onClick={togglePlayPause}
									>
										{isPlaying ? <Pause /> : <Play />}
									</Button>
									<div
										id="waveform"
										className="flex-1 min-w-0 h-8 overflow-hidden"
									>
										{/* Waveformライブラリの描画用要素 */}
									</div>
									<Button
										type="button"
										variant="ghost"
										onClick={removeAudio}
										className="hover:text-destructive p-2"
									>
										<Trash />
									</Button>
								</div>
							) : (
								<input
									type="text"
									placeholder={t("textbubble.ask")}
									className="p-2 md:p-3 flex-1 bg-transparent 
                       outline-none text-sm md:text-base"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
								/>
							)}
						</div>

						<Button
							type="submit"
							size="icon"
							className="w-10 h-12 md:w-12 md:h-16 shrink-0 text-background rounded-2xl"
							disabled={(message === "" && !audioURL) || session?.isReplying}
						>
							<Send />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}

// Create a container component that wraps QuickReply
const QuickReplyContainer: React.FC<{
	onReply: (reply: string) => void;
	quickReplies: string[] | null;
}> = ({ onReply, quickReplies }) => {
	const scrollRef = useHorizontalScroll(); // useHorizontalScroll here

	return (
		<div className="flex flex-wrap w-full overflow-auto pb-2" ref={scrollRef}>
			<QuickReply onReply={onReply} quickReplies={quickReplies} />
		</div>
	);
};
