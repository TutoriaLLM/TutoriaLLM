import { DoorOpen } from "lucide-react";
export function ExitButton(props: { text: string; onClick: () => void }) {
	return (
		<button
			type="button"
			className="flex gap-0.5 justify-center items-center bg-red-500 font-semibold hover:bg-red-300 transition-colors duration-150 border border-red-500 rounded-2xl p-2 md:p-4 text-white hover:text-gray-700"
			onClick={() => {
				props.onClick();
			}}
		>
			<DoorOpen />
			<span className="hidden sm:block">{props.text}</span>
		</button>
	);
}
