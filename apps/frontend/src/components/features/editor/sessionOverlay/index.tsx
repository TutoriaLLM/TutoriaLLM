import CreateNewSession from "@/components/features/editor/sessionOverlay/newsession";
import { CircleAlert } from "lucide-react";

import i18n from "i18next";
import { useTranslation } from "react-i18next";
import type { Message } from "@/routes/index.js";
import type { AuthSession } from "@/type";
import { UserAccount } from "@/components/common/profile/profile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type sessionPopupMessageTypes = "error" | "info";
export default function SessionPopup(props: {
	message: Message;
	setMessage: (message: Message) => void;
	session: AuthSession;
}) {
	const { t } = useTranslation();

	const messageText = t(props.message.message);

	const language = i18n.language;

	return (
		<Card>
			<CardHeader>
				<UserAccount session={props.session} />
			</CardHeader>
			<CardContent>
				<div className="w-full flex flex-col gap-2">
					<div className="flex flex-col gap-2 p-2 rounded-3xl bg-card shadow">
						<div className="p-3 bg-warning-foreground text-foreground font-normal border rounded-3xl w-full h-full flex justify-center items-center">
							<CircleAlert className="w-10 h-10 text-warning mr-2 justify-center items-center" />
							<p className="text-left w-full">{messageText}</p>
						</div>
						<div className="flex flex-col text-foreground justify-center items-center gap-3 p-6">
							<CreateNewSession
								language={language}
								setMessage={props.setMessage}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
