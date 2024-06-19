import { atom, useAtom, useAtomValue } from "jotai";
import React, { useEffect } from "react";

import { LanguageToStart, isPopupOpen } from "../../state.js";
import * as Dialog from "@radix-ui/react-dialog";
import JoinSession from "./joinsession.js";
import CreateNewSession from "./newsession.js";
import { CircleAlert, HelpCircle } from "lucide-react";

import { useTranslation } from "react-i18next";
import i18n from "i18next";

import { LangPicker } from "./language.js";

export default function SessionPopup(props: { message: string }) {
  const { t } = useTranslation();
  const showPopup = useAtomValue(isPopupOpen);
  const [languageToStart, setLanguageToStart] = useAtom(LanguageToStart);

  useEffect(() => {
    // i18nが初回ロード時に取得した言語をstateにセットする
    if (languageToStart === "") {
      setLanguageToStart(i18n.language);
    }
  }, [languageToStart, setLanguageToStart]);

  useEffect(() => {
    i18n.changeLanguage(languageToStart);
  }, [languageToStart]);

  const avoidDefaultDomBehavior = (e: Event) => {
    e.preventDefault();
  };

  return (
    <div>
      {showPopup && (
        <Dialog.Root open={showPopup}>
          <Dialog.Overlay className="fixed inset-0 z-[998] bg-gray-100 p-2">
            <Dialog.Content
              onPointerDownOutside={avoidDefaultDomBehavior}
              onInteractOutside={avoidDefaultDomBehavior}
              asChild
            >
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

                <div className=" bg-white rounded-3xl shadow p-3 w-full">
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
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Root>
      )}
    </div>
  );
}
