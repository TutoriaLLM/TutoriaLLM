import { cn } from "@/libs/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
	"rounded-full font-semibold justify-center items-center flex gap-0.5",
	{
		variants: {
			variant: {
				default: "bg-sky-500 text-white hover:bg-sky-600 ",
				red: "bg-red-500 text-white hover:bg-red-600 ",
				orange: "bg-orange-500 text-white hover:bg-orange-600 ",
			},
			size: {
				default: "p-1.5 px-2",
				lg: "p-2.5 md:p-3 md:px-4",
				xl: "p-2.5 px-3 md:p-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				className={cn(buttonVariants({ variant, size, className }))}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
