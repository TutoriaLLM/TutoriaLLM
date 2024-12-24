import { useEffect } from "react";

import CreateNewSession from "@/components/features/editor/sessionOverlay/newsession";
import * as Dialog from "@radix-ui/react-dialog";
import {
	CheckCircle,
	CircleAlert,
	CircleAlertIcon,
	LoaderCircle,
} from "lucide-react";

import i18n from "i18next";
import { useTranslation } from "react-i18next";

import { getStatus } from "@/api/health.js";
import { LangPicker } from "@/components/common/Langpicker.js";
import { DebugInfo } from "@/components/features/editor/sessionOverlay/debuginfo";
import Overlay from "@/components/ui/Overlay.js";
import type { Message } from "@/routes/index.js";
import { LanguageToStart } from "@/state.js";
import { setLanguageState } from "@/utils/setdefaultLanguage.js";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import type { AuthSession } from "@/type";
import { UserAccount } from "@/components/common/account";

export type sessionPopupMessageTypes = "error" | "info";
export default function SessionPopup(props: {
	isPopupOpen: boolean;
	message: Message;
	setMessage: (message: Message) => void;
	session: AuthSession;
}) {
	const { t } = useTranslation();
	const showPopup = props.isPopupOpen;
	const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);

	const messageText = t(props.message.message);
	const { data: isServerOnline } = useQuery({
		queryKey: ["serverStatus"],
		queryFn: getStatus,
		staleTime: 0,
		refetchOnWindowFocus: false,
		retry: false,
	});

	useEffect(() => {
		if (languageToStart === "") {
			setLanguageState(setLanguageToStart);
		}
	}, [languageToStart, setLanguageToStart]);

	useEffect(() => {
		i18n.changeLanguage(languageToStart);
	}, [languageToStart]);

	return (
		<div className="">
			{showPopup && (
				<Overlay
					openState={showPopup}
					Content={
						<div className="flex flex-col justify-center items-center max-w-xl w-full gap-3 bg-transparent p-2 z-[999] font-semibold ">
							<div className="w-full flex justify-between items-center p-2">
								<div className="flex flex-col gap-2 w-full flex-nowrap">
									<Dialog.Title className="text-3xl">
										{t("session.hello")}
										{props.session.user.name === "Anonymous"
											? ""
											: `, ${props.session.user.name}`}
									</Dialog.Title>
									<Dialog.Description className="text-md font-medium text-gray-600">
										{t("session.welcome")}
									</Dialog.Description>
								</div>
								<div className="text-xs md:text-nowrap">
									{isServerOnline === null ? (
										<span className="flex gap-2 justify-center items-center text-gray-500">
											{t("session.checkingServer")}
											<LoaderCircle className=" text-gray-500 w-8 h-8 animate-spin" />
										</span>
									) : isServerOnline ? (
										<span className="flex gap-2 justify-center items-center text-gray-500">
											{t("session.available")}
											<CheckCircle className=" text-green-500 w-8 h-8" />
										</span>
									) : (
										<span className="flex gap-2 justify-center items-center text-red-600">
											{t("session.serverOffline")}
											<CircleAlertIcon className=" text-red-500 w-8 h-8 animate-pulse" />
										</span>
									)}
								</div>
							</div>

							<div className=" p-3 w-full flex flex-col gap-2">
								<UserAccount session={props.session} />
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
							<LangPicker
								language={languageToStart}
								setLanguage={setLanguageToStart}
							/>
							<DebugInfo />
						</div>
					}
				/>
			)}
		</div>
	);
}
