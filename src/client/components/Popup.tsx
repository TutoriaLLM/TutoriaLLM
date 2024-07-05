import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";

export default function Popup(props: {
	openState: boolean;
	onClose: () => void;
	Content: JSX.Element;
}) {
	const showPopup = props.openState;

	return (
		<div>
			{showPopup && (
				<Dialog.Root open={showPopup} onOpenChange={props.onClose}>
					<Dialog.Overlay className="fixed inset-0 z-[998] bg-gray-200/10 backdrop-blur-md p-2">
						<Dialog.Content asChild>
							<div className="fixed flex flex-col max-w-3xl max-h-[80vh] overflow-scroll w-full gap-3 bg-white rounded-2xl p-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] font-semibold">
								{props.Content}
							</div>
						</Dialog.Content>
						<Dialog.Close>
							<span className="fixed top-0 right-0 p-2 m-4 bg-gray-200 rounded-full">
								<X />
							</span>
						</Dialog.Close>
					</Dialog.Overlay>
				</Dialog.Root>
			)}
		</div>
	);
}
