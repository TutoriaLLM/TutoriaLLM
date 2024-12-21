import * as Dialog from "@radix-ui/react-dialog";

export default function Overlay(props: {
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
							asChild={true}
						>
							<div className="flex justify-center items-center w-full h-full">
								{props.Content}
							</div>
						</Dialog.Content>
					</Dialog.Overlay>
				</Dialog.Root>
			)}
		</div>
	);
}
