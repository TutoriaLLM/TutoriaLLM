import * as Dialog from "@radix-ui/react-dialog";

export default function PopupDialog(props: {
	openState: boolean;
	Content: JSX.Element;
}) {
	const showPopup = props.openState;

	const avoidDefaultDomBehavior = (e: Event) => {
		e.preventDefault();
	};
	return (
		<div>
			{showPopup && (
				<Dialog.Root open={showPopup}>
					<Dialog.Overlay className="fixed inset-0 z-[998] bg-gray-200 p-2">
						<Dialog.Content
							onPointerDownOutside={avoidDefaultDomBehavior}
							onInteractOutside={avoidDefaultDomBehavior}
							asChild
						>
							<div className="fixed flex flex-col justify-center items-center max-w-md w-full gap-3 bg-transparent p-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] font-semibold">
								{props.Content}
							</div>
						</Dialog.Content>
					</Dialog.Overlay>
				</Dialog.Root>
			)}
		</div>
	);
}
