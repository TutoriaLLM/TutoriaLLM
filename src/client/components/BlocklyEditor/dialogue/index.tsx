import { useAtom } from "jotai";
import { Bot, PlusCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Dialogue } from "../../../../type";
import { currentSessionState } from "../../../state";
import TextBubble from "./parts/textbubble";
import TutorialPicker from "./tutorialPicker";

export default function DialogueView() {
	const [sessionState, setSessionState] = useAtom(currentSessionState);
	const [message, setMessage] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	function sendMessage(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault(); // デフォルトのフォーム送信を防止
		if (message) {
			setSessionState((prev) => {
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
						isReplying: true,
					};
				}
				return prev;
			});
			setMessage(""); // メッセージ送信後にフィールドをクリア

			// サーバーサイドからの応答をシミュレート
			setTimeout(() => {
				setSessionState((prev) => {
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
									contentType: "ai",
									isuser: false,
									content: "This is a response from the server.",
								},
							],
							isReplying: false, // 応答を受信したらisReplyingをfalseに設定
						};
					}
					return prev;
				});
			}, 2000); // 例として2秒後に応答を受信
		}
	}

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [sessionState?.dialogue]);

	return (
		<div className="w-full h-full flex flex-col justify-end bg-gray-100 font-medium">
			<div className="w-full h-full overflow-scroll flex flex-col gap-4 p-4 py-8">
				<TutorialPicker />
				{sessionState?.dialogue.map((item: Dialogue) => {
					return <TextBubble key={item.id} item={item} />;
				})}
				{/*/返信中のアニメーションを表示*/}
				{sessionState?.isReplying && (
					<div className="flex justify-start items-end gap-2 animate-pulse">
						<div className="text-gray-600 flex flex-col items-center">
							<span className="bg-gray-200 rounded-full p-2">
								<Bot />
							</span>
							<p className="text-xs">AI</p>
						</div>
						<div className="rounded-2xl rounded-bl-none bg-gray-300 text-gray-800 p-3 shadow max-w-xs">
							<p className="prose">Replying...</p>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<div className="w-full p-2">
				<div className="flex items-center bg-white shadow gap-2 p-2 rounded-2xl">
					<button
						type="button"
						className="p-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 flex"
					>
						<PlusCircle />
					</button>
					<form className="flex w-full gap-2" onSubmit={sendMessage}>
						<input
							type="text"
							placeholder="Ask anything..."
							className="flex-1 px-4 py-2 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<button
							type="submit" // buttonのtypeを'submit'に変更
							className={`p-2 text-white rounded-2xl flex ${
								message === ""
									? "bg-gray-300 transition"
									: "bg-sky-600 hover:bg-sky-700 transition"
							}`}
							disabled={message === ""}
						>
							<Send />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
