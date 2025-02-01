import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import { useToast } from "@/hooks/toast";
import type { Tutorial } from "@/type";
import { useTranslation } from "react-i18next";

export function TutorialUploader({
	setTutorialData,
	onUpload,
}: {
	setTutorialData: (tutorialData: Tutorial | null) => void;
	onUpload?: () => void;
}) {
	const { toast } = useToast();
	const { t } = useTranslation();
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const json = JSON.parse(e.target?.result as string);
					if (!(json.metadata && json.content && json.serializedNodes)) {
						toast({
							description: (
								<ErrorToastContent>
									{t("toast.failedToUploadTutorial")}
								</ErrorToastContent>
							),
							variant: "destructive",
						});
						return;
					}
					setTutorialData(json);
					if (onUpload) {
						onUpload();
					}
					toast({
						description: (
							<SuccessToastContent>
								{t("toast.failedToUploadTutorial")}
							</SuccessToastContent>
						),
						variant: "destructive",
					});
				} catch (error) {
					toast({
						description: (
							<ErrorToastContent>
								{t("toast.failedToUploadTutorial")}
							</ErrorToastContent>
						),
						variant: "destructive",
					});
				}
			};
			reader.readAsText(file);
		}
	};

	return (
		<div className="w-ful h-full">
			<input
				type="file"
				accept=".json"
				onChange={handleFileUpload}
				className="flex rounded-2xl border-2 border-gray-400 p-2"
			/>
		</div>
	);
}
