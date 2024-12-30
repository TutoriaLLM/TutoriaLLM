import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackToPrevPage() {
	const router = useRouter();
	const onBack = () => {
		router.history.back();
	};
	return (
		<Button onClick={() => onBack()}>
			<ChevronLeft className="w-5 h-5" />
			Back
		</Button>
	);
}
