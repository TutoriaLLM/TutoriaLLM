import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export function ErrorToastContent({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex gap-2 justify-center items-center">
			<XCircleIcon className="text-destructive" />
			{children}
		</div>
	);
}

export function SuccessToastContent({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="flex gap-2 justify-center items-center">
			<CheckCircleIcon className="text-secondary" />
			{children}
		</div>
	);
}
