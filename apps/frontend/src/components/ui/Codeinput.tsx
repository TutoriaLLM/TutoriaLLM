import { OTPInput, type SlotProps } from "input-otp";
import React from "react";

const Slot = (props: SlotProps) => (
	<div className="h-10 w-10 border-2 border-gray-400 bg-white rounded-2xl flex justify-center items-center p-0.5 font-semibold text-gray-800">
		{props.char !== null && <div>{props.char}</div>}
		{props.hasFakeCaret && (
			<div className="w-0.5 h-full bg-gray-400 rounded-full animate-caret-blink" />
		)}
	</div>
);

const CodeInput = React.forwardRef<
	HTMLInputElement,
	{ onComplete: () => void }
>(({ onComplete }, ref) => (
	<OTPInput
		ref={ref}
		inputMode="text"
		textAlign="center"
		maxLength={6}
		containerClassName="group flex items-center w-full gap-2 justify-center"
		render={({ slots }) => (
			<>
				<div className="flex text-3xl gap-1">
					{slots.slice(0, 3).map((slot, idx) => (
						<Slot key={idx} {...slot} />
					))}
				</div>

				<div className="flex w-3 justify-center items-center" />

				<div className="flex text-3xl gap-1">
					{slots.slice(3).map((slot, idx) => (
						<Slot key={idx} {...slot} />
					))}
				</div>
			</>
		)}
		onComplete={onComplete}
	/>
));

export default CodeInput;
