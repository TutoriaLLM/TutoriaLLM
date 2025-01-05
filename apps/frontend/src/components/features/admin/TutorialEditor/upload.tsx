import { useToast } from "@/hooks/toast";
import type { Tutorial } from "@/type";

export function TutorialUploader({
	setTutorialData,
	onUpload,
}: {
	setTutorialData: (tutorialData: Tutorial | null) => void;
	onUpload?: () => void;
}) {
	const { toast } = useToast();
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const json = JSON.parse(e.target?.result as string);
					if (!(json.metadata && json.content && json.serializednodes)) {
						alert(
							"Invalid JSON format. Please check the format and try again.",
						);
						return;
					}
					setTutorialData(json);
					if (onUpload) {
						onUpload();
					}
					toast({
						description: "Tutorial uploaded successfully",
					});
				} catch (error) {
					alert("Falied to parse JSON. Please check the format and try again.");
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
