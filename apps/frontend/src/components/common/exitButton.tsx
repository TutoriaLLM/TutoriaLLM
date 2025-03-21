import { Button } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";

export function ExitButton(props: { text: string; onClick: () => void }) {
	return (
		<Button
			className="rounded-2xl text-nowrap"
			type="button"
			variant="destructive"
			size="xl"
			onClick={() => {
				props.onClick();
			}}
		>
			<DoorOpen />
			<span>{props.text}</span>
		</Button>
	);
}
