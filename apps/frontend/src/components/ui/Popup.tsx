import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { X } from "lucide-react";

export default function Popup(props: {
	openState: boolean;
	container?: HTMLElement;
	onClose: () => void;
	Content: JSX.Element;
}) {
	const showPopup = props.openState;

	const content = (
		<Dialog.Overlay className="fixed w-full h-full inset-0 z-[997] bg-sky-800/10 backdrop-blur-md p-2 data-[state=open]:animate-fade-in data-[state=close]:animate-fade-out">
			<VisuallyHidden.Root>
				<Dialog.Title>Popup</Dialog.Title>
				<Dialog.Description>Popup contents</Dialog.Description>
			</VisuallyHidden.Root>

			<Dialog.Content asChild={true}>
				<div className="fixed flex flex-col max-w-6xl w-full max-h-[80vh] gap-3 bg-white rounded-2xl p-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[998] font-semibold overflow-y-auto data-[state=open]:animate-fade-in data-[state=close]:animate-fade-out">
					{props.Content}
				</div>
			</Dialog.Content>
			<Dialog.Close asChild={true}>
				<span className="fixed top-4 right-4 p-2 bg-gray-200 rounded-full z-[999]">
					<X />
				</span>
			</Dialog.Close>
		</Dialog.Overlay>
	);

	return (
		showPopup && (
			<Dialog.Root open={showPopup} onOpenChange={props.onClose}>
				{props.container ? (
					<Dialog.Portal container={props.container}>{content}</Dialog.Portal>
				) : (
					content
				)}
			</Dialog.Root>
		)
	);
}
