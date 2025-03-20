import * as React from "react";

import { cn } from "@/libs/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"w-full p-1.5 border-2 border-gray-400 text-foreground rounded-2xl",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

const FileInput = React.forwardRef<
	HTMLInputElement,
	Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> & {
		value?: File;
		onChange?: (file: File | undefined) => void;
	}
>(({ className, onChange, value: _value, ...props }, ref) => {
	return (
		<input
			type="file"
			className={cn(
				"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			onChange={(e) => onChange?.(e.target.files?.[0])}
			ref={ref}
			{...props}
		/>
	);
});
FileInput.displayName = "FileInput";

export { Input, FileInput };
