import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackToPrevPage({ path }: { path?: string }) {
	const router = useRouter();
	const onBack = () => {
		if (path) {
			router.history.push(path);
			return;
		}
		router.history.back();
	};
	return (
		<Button onClick={() => onBack()}>
			<ChevronLeft className="w-5 h-5" />
			Back
		</Button>
	);
}
