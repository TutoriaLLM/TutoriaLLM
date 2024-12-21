import { useState } from "react";

//ツアーの読み込み
import SessionPopup, {
	type sessionPopupMessageTypes,
} from "@/components/features/editor/sessionOverlay/index.js";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: EditorPage, // This is the main
});
export type Message = {
	type: sessionPopupMessageTypes;
	message: string;
};

function EditorPage() {
	const [message, setMessage] = useState<Message>({
		type: "info",
		message: "session.typecodeMsg",
	});
	return (
		<SessionPopup
			isPopupOpen={true}
			message={message}
			setMessage={setMessage}
		/>
	);
}
