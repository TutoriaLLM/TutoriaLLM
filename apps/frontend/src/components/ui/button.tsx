import { cn } from "@/libs/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
	"font-semibold justify-center items-center flex transition gap-1 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80 ",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/80 ",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80 ",
				ghost:
					"bg-transparent text-accent-foreground hover:bg-accent/80 hover:text-accent-foreground/80",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
			},
			size: {
				icon: "h-10 w-10 rounded-full",
				sm: "py-1 px-2 md:py-1.5 md:px-2.5  text-sm rounded-xl",
				default: "py-2 px-4 md:py-2.5 md:px-3 rounded-2xl",
				lg: "p-2.5 md:p-3 md:px-4 rounded-2xl",
				xl: "p-2.5 px-3 md:p-4 rounded-2xl",
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
