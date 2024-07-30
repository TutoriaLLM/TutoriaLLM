import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import CodeInput from "../../ui/Codeinput.js";

export default function JoinSession() {
	const { t } = useTranslation();

	const inputRef = useRef<HTMLInputElement>(null);
	function moveToPath() {
		//指定されたセッションのパスに移動する
		const inputCode = inputRef.current?.value as string;
		window.location.href = `/${inputCode}`;
		console.log(`join session${inputCode}`);
	}
	//inputrefのデバッグ
	useEffect(() => {
		console.log("inputRef", inputRef);
	}, [inputRef]);
	return (
		<div className="flex flex-col justify-center items-center gap-1.5 p-2 bg-gray-100 rounded-2xl">
			<span>{t("session.joinsession")}</span>
			<CodeInput onComplete={() => moveToPath()} ref={inputRef} />
		</div>
	);
}
