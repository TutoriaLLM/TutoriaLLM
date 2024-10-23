import { useAtom, useAtomValue } from "jotai";
import { Bot, Send, Mic, Trash, Play, Pause } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { AppConfig, Dialogue } from "../../../../type.js";
import { currentSessionState } from "../../../state.js";
import TextBubble from "./parts/textbubble.js";
import { SwitchModeUI } from "./parts/ui/switchModeUI.js";
import { useTranslation } from "react-i18next";
import QuickReply from "./parts/quickreply.js";
import { updateStats } from "../../../../utils/statsUpdater.js";
import {
	HorizontalScrollProvider,
	useHorizontalScroll,
} from "../../ui/horizontalScroll.js";
import WaveSurfer from "wavesurfer.js";

export default function DialogueView() {
	const { t } = useTranslation();
	const [session, setSession] = useAtom(currentSessionState);
	const [config, setConfig] = useState<AppConfig>();
	const [message, setMessage] = useState("");
	const [audioURL, setAudioURL] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [remainingTime, setRemainingTime] = useState(10);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const wavesurferRef = useRef<WaveSurfer | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const [isSending, setIsSending] = useState(false); // メッセージ送信中かどうかを管理

	useEffect(() => {
		async function fetchConfig() {
			const result = await fetch("/api/config");
			const response = (await result.json()) as AppConfig;
			setConfig(response);
		}
		fetchConfig();
	}, []);

	const sendMessage = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault(); // デフォルトのフォーム送信を防止

			//オーディオの場合（メッセージは空である必要がある）
			if (
				(audioURL && !isSending && !message) ||
				config?.AI_Settings.Chat_Audio === true
			) {
				// すでに送信中でないことを確認
				setIsSending(true); // 送信中フラグを立てる
				setSession((prev) => {
					if (prev) {
						const lastId =
							prev.dialogue.length > 0
								? prev.dialogue[prev.dialogue.length - 1].id
								: 0;
						return {
							...prev,
							dialogue: [
								...prev.dialogue,
								{
									id: lastId + 1,
									contentType: "user_audio",
									isuser: true,
									content: "",
								},
							],
							stats: updateStats(
								{
									totalUserMessages: prev.stats.totalUserMessages + 1,
								},
								prev,
							).stats,
							userAudio: audioURL, // base64エンコードされたMP3データを設定
						};
					}
					return prev;
				});
				setMessage(""); // メッセージ送信後にフィールドをクリア
				setAudioURL(""); // オーディオURLをクリア
				setIsSending(false); // 送信完了後に送信中フラグをリセット
			}

			//メッセージの場合
			if (message && !isSending && !audioURL) {
				// すでに送信中でないことを確認
				setIsSending(true); // 送信中フラグを立てる
				setSession((prev) => {
					if (prev) {
						const lastId =
							prev.dialogue.length > 0
								? prev.dialogue[prev.dialogue.length - 1].id
								: 0;
						return {
							...prev,
							dialogue: [
								...prev.dialogue,
								{
									id: lastId + 1,
									contentType: "user",
									isuser: true,
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
				setMessage(""); // メッセージ送信後にフィールドをクリア
				setAudioURL(""); // オーディオURLをクリア
				setIsSending(false); // 送信完了後に送信中フラグをリセット
			}
		},
		[message, audioURL, isSending, setSession],
	);

	const handleQuickReply = useCallback((reply: string) => {
		setMessage(reply);
	}, []);

	useEffect(() => {
		if (messagesEndRef.current) {
			// 少し遅らせてスクロールを実行
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 150); // レンダリングを待つために 150ms 遅らせる
		}
	}, [session?.dialogue]);

	const startRecording = () => {
		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			mediaRecorder.start();

			const audioChunks: Blob[] = [];
			mediaRecorder.addEventListener("dataavailable", (event) => {
				audioChunks.push(event.data);
			});

			mediaRecorder.addEventListener("stop", () => {
				const audioBlob = new Blob(audioChunks, { type: "audio/mp3" }); // MP3形式に設定
				const reader = new FileReader();
				reader.readAsDataURL(audioBlob);
				reader.onloadend = () => {
					const base64data = reader.result as string;
					setAudioURL(base64data);

					// 新しい wavesurfer インスタンスを生成
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
			setRecordingTime(0);
			setRemainingTime(10);

			intervalRef.current = setInterval(() => {
				setRecordingTime((prev) => {
					if (prev >= 10) {
						stopRecording();
						return prev;
					}
					return prev + 1;
				});
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
			//テキストメッセージは無効にする
			setMessage("");
		}
	}, [audioURL]);

	return (
		<div className="dialogue grow w-full h-full flex flex-col justify-end bg-gray-100 font-medium ">
			<SwitchModeUI audio={config?.AI_Settings.Chat_Audio} />
			<div className="w-full h-full flex flex-col overflow-y-scroll relative gap-4 px-4 py-1.5 ">
				{session?.dialogue.map((item: Dialogue) => {
					return (
						<TextBubble
							key={item.id}
							item={item}
							easyMode={session?.easyMode}
						/>
					);
				})}
				{/*返信中のアニメーションを表示*/}
				{session?.isReplying && (
					<div className="flex justify-start items-end gap-2 animate-loading-blink">
						<div className="text-gray-600 flex flex-col items-center">
							<span className="bg-gray-200 rounded-full p-2">
								<Bot />
							</span>
							<p className="text-xs">{t("textbubble.ai")}</p>
						</div>
						<div className="rounded-2xl rounded-bl-none bg-gray-300 text-gray-800 p-3 shadow max-w-sm">
							<p className="prose bg-gradient-to-r from-gray-500 from-30% via-gray-700 via-50% to-gray-500 to-70% bg-[size:280%] bg-center flex animate-loading-flow text-transparent bg-clip-text">
								{t("textbubble.replying")}
							</p>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<div className="w-full p-2">
				<div className="items-center bg-white shadow gap-2 p-2 rounded-2xl w-full">
					{session?.quickReplies && (
						<div className="relative w-full py-2.5 overflow-clip">
							{/* HorizontalScrollProviderでコンテキストを提供 */}
							<HorizontalScrollProvider>
								<QuickReplyContainer
									onReply={handleQuickReply}
									quickReplies={session?.quickReplies || null}
								/>
							</HorizontalScrollProvider>
							<div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
							<div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
						</div>
					)}

					<form className="flex w-full gap-2" onSubmit={sendMessage}>
						{config?.AI_Settings.Chat_Audio && (
							<button
								type="button"
								onClick={isRecording ? stopRecording : startRecording}
								className={`w-12 h-16 text-white rounded-2xl flex justify-center items-center relative transition-colors  ${
									isRecording ? "bg-red-500" : "bg-green-600 hover:bg-green-700"
								}`}
							>
								{isRecording ? (
									<div className="flex items-center justify-center">
										<div className="relative">
											<svg className="w-12 h-12">
												<title>Recording Remaining Time</title>
												<circle
													className="text-gray-300"
													strokeWidth="4"
													stroke="currentColor"
													fill="transparent"
													r="18"
													cx="24"
													cy="24"
												/>
												<circle
													className="text-rose-600"
													strokeWidth="4"
													strokeDasharray="113"
													strokeDashoffset={(113 * remainingTime) / 10}
													strokeLinecap="round"
													stroke="currentColor"
													fill="transparent"
													r="18"
													cx="24"
													cy="24"
												/>
											</svg>
											<span className="absolute inset-0 flex items-center justify-center text-xs text-red-100">
												{remainingTime}
											</span>
										</div>
									</div>
								) : (
									<Mic />
								)}
							</button>
						)}
						<div className="flex-1 flex borde gap-2 p-1 rounded-2xl bg-gray-100 outline-none focus:ring-2 focus:ring-blue-500">
							{audioURL ? (
								<div className="flex gap-2 p-1 justify-center items-center rounded-full bg-gray-200 animate-fade-in">
									<button
										type="button"
										className="text-gray-400 hover:text-green-400 p-2"
										onClick={togglePlayPause}
									>
										{isPlaying ? <Pause /> : <Play />}
									</button>
									<div id="waveform" className="w-12 h-8" />
									<button
										type="button"
										onClick={removeAudio}
										className="text-gray-400 hover:text-rose-400 p-2"
									>
										<Trash />
									</button>
								</div>
							) : (
								<input
									type="text"
									placeholder={t("textbubble.ask")}
									className="p-3 flex-1 bg-transparent outline-none"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
								/>
							)}
						</div>

						<button
							type="submit"
							className={`w-12 h-16 text-white rounded-2xl flex justify-center items-center transition-colors ${
								(message === "" && !audioURL) || session?.isReplying
									? "bg-gray-300 transition"
									: "bg-sky-600 hover:bg-sky-700 transition"
							}`}
							disabled={(message === "" && !audioURL) || session?.isReplying}
						>
							<Send />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

// QuickReplyをラップするコンテナコンポーネントを作成
const QuickReplyContainer: React.FC<{
	onReply: (reply: string) => void;
	quickReplies: string[] | null;
}> = ({ onReply, quickReplies }) => {
	const scrollRef = useHorizontalScroll(); // useHorizontalScrollをここで使用

	return (
		<div className="flex flex-wrap w-full overflow-auto pb-2" ref={scrollRef}>
			<QuickReply onReply={onReply} quickReplies={quickReplies} />
		</div>
	);
};
