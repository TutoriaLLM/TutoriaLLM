import { OTPInput, SlotProps } from "input-otp";
import { useSetAtom } from "jotai";

import { userSessionCode } from "../../state";
import { useRef } from "react";

import { useTranslation } from "react-i18next";

export default function JoinSession() {
  const { t } = useTranslation();
  function Slot(props: SlotProps) {
    return (
      <div className="h-10 w-10 border-2 border-gray-400 rounded-2xl flex justify-center items-center p-0.5 font-semibold text-gray-800">
        {props.char !== null && <div>{props.char}</div>}
        {props.hasFakeCaret && (
          <div className="w-0.5 h-full bg-gray-400 rounded-full animate-caret-blink" />
        )}
      </div>
    );
  }
  const inputRef = useRef<HTMLInputElement>(null);
  function moveToPath() {
    //指定されたセッションのパスに移動する
    const inputCode = inputRef.current?.value as string;
    window.location.href = "/" + inputCode;
    console.log("join session" + inputCode);
  }
  return (
    <div className="flex flex-col justify-center items-center gap-1.5 p-2 bg-stone-200 rounded-2xl w-full">
      <span>{t("session.joinsession")}</span>
      <OTPInput
        ref={inputRef}
        inputMode="text"
        textAlign="center"
        maxLength={6}
        containerClassName="group flex items-center w-full gap-2 justify-center"
        render={({ slots }) => (
          <>
            <div className="flex text-3xl gap-1">
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>

            <div className="flex w-3 justify-center items-center"></div>

            <div className="flex text-3xl gap-1">
              {slots.slice(3).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          </>
        )}
        //update code status
        onComplete={() => moveToPath()}
      />
    </div>
  );
}
