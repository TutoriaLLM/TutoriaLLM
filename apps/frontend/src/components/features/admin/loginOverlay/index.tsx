import { LangPicker } from "@/components/common/Langpicker.js";
import Overlay from "@/components/ui/Overlay.js";
import { LanguageToStart } from "@/state.js";
import * as Dialog from "@radix-ui/react-dialog";
import i18n from "i18next";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Login from "./login.js";

export default function LoginPopup(props: {
	isPopupOpen: boolean;
	message: string;
	redirectTo: string;
}) {
	const { t } = useTranslation();
	const showPopup = props.isPopupOpen;

	const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);

	useEffect(() => {
		if (languageToStart === "") {
			setLanguageToStart(i18n.language);
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
									{t("login.title")}
								</Dialog.Title>
								<Dialog.Description className="text-md font-medium text-gray-600">
									{t("login.welcome")}
								</Dialog.Description>
							</div>
							<div className=" bg-white rounded-3xl shadow p-3 w-full">
								<Login redirectTo={props.redirectTo} />
							</div>
							<LangPicker
								language={languageToStart}
								setLanguage={setLanguageToStart}
							/>
						</div>
					}
				/>
			)}
		</div>
	);
}
