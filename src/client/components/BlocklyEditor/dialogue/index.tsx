import { useAtom } from "jotai";
import { Bot, PlusCircle, Send } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Dialogue } from "../../../../type.js";
import { currentSessionState } from "../../../state.js";
import TextBubble from "./parts/textbubble.js";
import OnBoarding from "./onBoarding.js";
import { useTranslation } from "react-i18next";
import QuickReply from "./parts/quickreply.js";
import { updateStats } from "../../../../utils/statsUpdater.js";

export default function DialogueView() {
	const { t } = useTranslation();
	const [session, setSession] = useAtom(currentSessionState);
	const [message, setMessage] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const sendMessage = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault(); // デフォルトのフォーム送信を防止
			if (message) {
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
							isReplying: true,
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
			}
		},
		[message, setSession],
	);

	const handleQuickReply = useCallback((reply: string) => {
		setMessage(reply);
	}, []);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [session?.dialogue]);

	return (
		<div className="dialogue w-full h-full flex flex-col justify-end bg-gray-100 font-medium">
			<div className="w-full h-full flex flex-col overflow-x-scroll gap-4 p-4 py-8">
				<OnBoarding />
				{session?.dialogue.map((item: Dialogue) => {
					return <TextBubble key={item.id} item={item} />;
				})}
				{/*返信中のアニメーションを表示*/}
				{session?.isReplying && (
					<div className="flex justify-start items-end gap-2 animate-pulse">
						<div className="text-gray-600 flex flex-col items-center">
							<span className="bg-gray-200 rounded-full p-2">
								<Bot />
							</span>
							<p className="text-xs">{t("textbubble.ai")}</p>
						</div>
						<div className="rounded-2xl rounded-bl-none bg-gray-300 text-gray-800 p-3 shadow max-w-sm">
							<p className="prose">{t("textbubble.replying")}</p>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<div className="w-full p-2">
				<div className="items-center bg-white shadow gap-2 p-2 rounded-2xl w-full">
					<div className="relative w-full py-2.5 overflow-clip">
						<div className="flex flex-wrap w-full overflow-x-scroll">
							<QuickReply onReply={handleQuickReply} />
						</div>
						<div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
						<div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
					</div>

					<form className="flex w-full gap-2" onSubmit={sendMessage}>
						<input
							type="text"
							placeholder={t("textbubble.ask")}
							className="flex-1 p-3 border rounded-2xl bg-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<button
							type="submit" // buttonのtypeを'submit'に変更
							className={`p-3 text-white rounded-2xl flex ${
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
