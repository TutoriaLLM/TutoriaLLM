import { useEffect } from "react";

import CreateNewSession from "@/components/features/editor/sessionOverlay/newsession";
import { CircleAlert } from "lucide-react";

import i18n from "i18next";
import { useTranslation } from "react-i18next";
import type { Message } from "@/routes/index.js";
import { LanguageToStart } from "@/state.js";
import { setLanguageState } from "@/utils/setdefaultLanguage.js";
import { useAtom } from "jotai";
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
	const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);

	const messageText = t(props.message.message);

	useEffect(() => {
		if (languageToStart === "") {
			setLanguageState(setLanguageToStart);
		}
	}, [languageToStart, setLanguageToStart]);

	useEffect(() => {
		i18n.changeLanguage(languageToStart);
	}, [languageToStart]);

	return (
		<Card>
			<CardHeader>
				<UserAccount session={props.session} />
			</CardHeader>
			<CardContent>
				<div className="w-full flex flex-col gap-2">
					<div className="flex flex-col gap-2 p-2 rounded-3xl bg-gray-100 shadow">
						<div className="p-3 bg-yellow-200 text-gray-600 font-normal border rounded-3xl w-full h-full flex justify-center items-center">
							<CircleAlert className="w-10 h-10 text-yellow-500 mr-2 justify-center items-center" />
							<p className="text-left w-full">{messageText}</p>
						</div>
						<div className="flex flex-col text-gray-700 justify-center items-center gap-3 p-6">
							<CreateNewSession
								language={languageToStart}
								setMessage={props.setMessage}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
