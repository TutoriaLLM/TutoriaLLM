export const AdminFooterWrapper = ({
	children,
}: { children: React.ReactNode }) => {
	return (
		<div className="w-full h-full overflow-auto bg-background border rounded-2xl p-2 md:p-4 space-y-3">
			{children}
		</div>
	);
};
