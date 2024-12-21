import { useRef } from "react";

import { getSession } from "@/api/session.js";
import CodeInput from "@/components/common/Codeinput.js";
import type { Message } from "@/routes/index.js";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function JoinSession({
	setMessage,
}: {
	setMessage: (message: Message) => void;
}) {
	const { t } = useTranslation();

	const inputRef = useRef<HTMLInputElement>(null);
	async function moveToPath() {
		// Navigate to the specified session path
		const inputCode = inputRef.current?.value as string;
		const session = await getSession({ key: inputCode });
		if (!session) {
			setMessage({ type: "error", message: t("session.invalidcode") });
			useRouter().navigate({ to: `/${inputCode}` });
		}
	}
	return (
		<div className="flex flex-col justify-center items-center gap-1.5 p-2 bg-gray-100 rounded-2xl">
			<span>{t("session.joinsession")}</span>
			<CodeInput onComplete={() => moveToPath()} ref={inputRef} />
		</div>
	);
}
