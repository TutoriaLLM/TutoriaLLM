import * as React from "react";

import { cn } from "@/libs/utils";

const Select = React.forwardRef<
	HTMLSelectElement,
	React.ComponentProps<"select">
>(({ className, ...props }, ref) => (
	<select
		ref={ref}
		className={cn(
			"p-2 rounded-2xl bg-accent text-accent-foreground font-semibold",
			className,
		)}
		{...props}
	/>
));
Select.displayName = "Select";

export { Select };
