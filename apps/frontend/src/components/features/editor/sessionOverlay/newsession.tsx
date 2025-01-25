import { createSession } from "@/api/session";
import SavedData from "@/components/features/editor/sessionOverlay/savedData";
import { Button } from "@/components/ui/button";
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
		mutationFn: createSession,
		onSuccess: ({ sessionId }) => {
			router.navigate({ to: `/${sessionId}` });
		},
		onError: (error) => {
			console.error("Failed to create a new session:", error);
			setMessage({ type: "error", message: t("session.failedCreate") });
		},
	});

	return (
		<div className="flex gap-2 flex-wrap sm:flex-nowrap justify-center items-center">
			<Button
				onClick={() => {
					mutate({
						language: language,
					});
				}}
				disabled={isPending}
			>
				{isPending ? t("session.creating") : t("session.createSession")}{" "}
				<Plus />
			</Button>

			<SavedData />
		</div>
	);
}
