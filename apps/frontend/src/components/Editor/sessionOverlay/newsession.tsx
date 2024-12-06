import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import SavedData from "@/components/Editor/sessionOverlay/savedData";
import { useMutation } from "@/hooks/use-mutations";
import { createSession } from "@/api/session";

export default function CreateNewSession(props: { language: string }) {
	const { t } = useTranslation();

	const { mutate, isPending } = useMutation({
		onMutate: () => {
			console.log("create session");
		},
		mutationFn: createSession,
		onSuccess: (sessionCode) => {
			console.log(`session created${sessionCode}`);
			window.location.href = `/${sessionCode}`;
		},
		onError: (error) => {
			console.error("Failed to create a new session:", error);
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
						language: props.language,
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
