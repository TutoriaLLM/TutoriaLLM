import React, { useEffect, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { CircleAlert, HelpCircle } from "lucide-react";
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
		<div>
			{showPopup && (
				<Overlay
					openState={showPopup}
					Content={
						<div className="fixed flex flex-col justify-center items-center max-w-md w-full gap-3 bg-transparent p-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] font-semibold">
							<div className="w-full flex flex-col justify-center items-center p-2 gap-2">
								<Dialog.Title className="text-3xl">
									{t("session.hello")}
								</Dialog.Title>
								<Dialog.Description className="text-md font-medium text-gray-600">
									{t("session.welcome")}
								</Dialog.Description>
								{/* <a
              href="about"
              className=" p-2 rounded-xl bg-gray-200 hover:bg-gray-300 flex gap-1.5 justify-center items-center"
            >
              <HelpCircle className="w-6 h-6" />
              {t("session.about")}
            </a> */}
							</div>

							<div className="bg-gray-50 rounded-3xl shadow p-3 w-full">
								<div className="p-1.5 py-2 bg-yellow-200 text-gray-600 font-normal border rounded-2xl w-full h-full flex justify-center items-center">
									<CircleAlert className="w-10 h-10 text-yellow-500 mr-2 justify-center items-center" />
									<p className="text-left w-full"> {props.message}</p>
								</div>
								<div className=" flex flex-col text-gray-700 justify-center items-center gap-3 p-6">
									<CreateNewSession language={languageToStart} />

									<span className="">{t("session.or")}</span>
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
