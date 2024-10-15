import React, { useEffect, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import {
	CheckCircle,
	CircleAlert,
	CircleAlertIcon,
	HelpCircle,
	LoaderCircle,
} from "lucide-react";
import JoinSession from "./joinsession.js";
import CreateNewSession from "./newsession.js";

import i18n from "i18next";
import { useTranslation } from "react-i18next";

import { useAtom } from "jotai";
import { LanguageToStart } from "../../../state.js";
import { LangPicker } from "../../ui/Langpicker.js";
import Overlay from "../../ui/Overlay.js";
import { DebugInfo } from "./debuginfo.js";

export type sessionPopupMessageTypes = "error" | "info";
export default function SessionPopup(props: {
	isPopupOpen: boolean;
	message: string;
	messageType: "error" | "info";
}) {
	const { t } = useTranslation();
	const showPopup = props.isPopupOpen;
	const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);
	const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			setIsServerOnline(false);
		}, 3000);

		fetch("/api/status", { signal: controller.signal })
			.then((response) => {
				clearTimeout(timeoutId);
				if (response.ok) {
					setIsServerOnline(true);
				} else {
					setIsServerOnline(false);
				}
			})
			.catch((error) => {
				if (error.name === "AbortError") {
					console.log("Fetch aborted due to timeout");
				} else {
					console.error("Error checking server status:", error);
				}
				setIsServerOnline(false);
			});

		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		if (languageToStart === "") {
			const detectedLanguage = navigator.language || i18n.language;
			const baseLanguage = detectedLanguage.split("-")[0]; // Get the base language code
			const supportedLanguages = i18n.languages;
			console.log("Detected language: ", baseLanguage);
			console.log("Supported languages: ", supportedLanguages);
			const language = supportedLanguages.includes(baseLanguage)
				? baseLanguage
				: "en"; // Default to English if the detected language is not supported
			setLanguageToStart(language);
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
						<div className="flex flex-col justify-center items-center max-w-xl w-full gap-3 bg-transparent p-2 z-[999] font-semibold">
							<div className="w-full flex justify-between items-center p-2">
								<div className="flex flex-col gap-2 w-full flex-nowrap">
									<Dialog.Title className="text-3xl">
										{t("session.hello")}
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

							<div className="bg-gray-50 rounded-3xl shadow p-3 w-full">
								<div className="p-1.5 py-2 bg-yellow-200 text-gray-600 font-normal border rounded-2xl w-full h-full flex justify-center items-center">
									<CircleAlert className="w-10 h-10 text-yellow-500 mr-2 justify-center items-center" />
									<p className="text-left w-full">{props.message}</p>
								</div>
								<div className="flex flex-col text-gray-700 justify-center items-center gap-3 p-6">
									<CreateNewSession language={languageToStart} />

									<span>{t("session.or")}</span>
									<JoinSession />
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
