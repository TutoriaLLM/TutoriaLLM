import { useState } from "react";

// Loading Tour
import SessionPopup, {
	type sessionPopupMessageTypes,
} from "@/components/features/editor/sessionOverlay/index.js";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/libs/auth-client";

export const Route = createFileRoute("/")({
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
	loader: async ({ context: { getSession } }) => {
		return await getSession();
	},
	component: Home,
});
export type Message = {
	type: sessionPopupMessageTypes;
	message: string;
};

function Home() {
	const [message, setMessage] = useState<Message>({
		type: "info",
		message: "session.typecodeMsg",
	});
	const session = Route.useLoaderData();
	return (
		<SessionPopup
			isPopupOpen={true}
			message={message}
			setMessage={setMessage}
			session={session}
		/>
	);
}
