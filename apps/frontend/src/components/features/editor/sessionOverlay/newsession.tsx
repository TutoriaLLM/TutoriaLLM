import { createSession } from "@/api/session";
import SavedData from "@/components/features/editor/sessionOverlay/savedData";
import { useMutation } from "@/hooks/useMutations";
import type { Message } from "@/routes";
import { useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CreateNewSession({
	language,
	setMessage,
}: { language: string; setMessage: (message: Message) => void }) {
	const { t } = useTranslation();
	const router = useRouter();
	const { mutate, isPending } = useMutation({
		onMutate: () => {
			console.log("create session");
		},
		mutationFn: createSession,
		onSuccess: ({ sessionCode }) => {
			router.navigate({ to: `/${sessionCode}` });
		},
		onError: (error) => {
			console.error("Failed to create a new session:", error);
			setMessage({ type: "error", message: t("session.failedCreate") });
		},
	});

	return (
		<div className="flex gap-2">
			<button
				type="button"
				className={`bg-sky-500 justify-between hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-2xl flex transition-all items-center ${
					isPending ? "opacity-50 cursor-not-allowed" : ""
				}`}
				onClick={() => {
					mutate({
						language: language,
					});
				}}
				disabled={isPending}
			>
				{isPending ? t("session.creating") : t("session.createSession")}{" "}
				<Plus />
			</button>
			<SavedData />
		</div>
	);
}
