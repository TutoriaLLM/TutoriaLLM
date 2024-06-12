import { atom, useAtom } from "jotai";
import React, { useEffect } from "react";

import { LanguageToStart, isPopupOpen } from "../../state";
import * as Dialog from "@radix-ui/react-dialog";
import JoinSession from "./joinsession";
import CreateNewSession from "./newsession";
import { CircleAlert } from "lucide-react";

import { useTranslation } from "react-i18next";
import i18n from "i18next";

import { LangPicker } from "./language";

export default function SessionPopup(props: { message: string }) {
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useAtom(isPopupOpen);
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
        <Dialog.Root open={showPopup} onOpenChange={setShowPopup}>
          <Dialog.Overlay className="fixed inset-0 bg-gray-200 z-[998]" />

          <Dialog.Content
            onPointerDownOutside={avoidDefaultDomBehavior}
            onInteractOutside={avoidDefaultDomBehavior}
            className="fixed flex flex-col font-semibold text-gray-700 justify-center max-w-md items-center gap-3 bg-white p-6 rounded-3xl shadow-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999]"
          >
            <Dialog.Title className="text-3xl">
              {t("session.hello")}
            </Dialog.Title>
            <div className="p-1.5 py-2 bg-yellow-200 text-gray-600 font-normal border rounded-2xl w-full h-full flex justify-center items-center">
              <CircleAlert className="w-10 h-10 text-yellow-500 mr-2 justify-center items-center" />
              <p className="text-left w-full"> {props.message}</p>
            </div>
            <span className="my-2 h-0.5 w-[75%] rounded-full bg-gray-200" />
            <CreateNewSession language={languageToStart} />
            <span className="">{t("session.or")}</span>
            <JoinSession />
            <span className="my-2 h-0.5 w-[75%] rounded-full bg-gray-200" />

            <LangPicker
              language={languageToStart}
              setLanguage={setLanguageToStart}
            />
          </Dialog.Content>
        </Dialog.Root>
      )}
    </div>
  );
}
