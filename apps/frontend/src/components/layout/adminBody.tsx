export const AdminBodyWrapper = ({
	children,
	title,
}: { children: React.ReactNode; title: string }) => {
	return (
		<div className="w-full h-full overflow-auto bg-background border rounded-2xl py-3 space-y-3">
			<div className="flex justify-between p-4 w-full">
				<h2 className="text-xl md:text-2xl font-semibold text-foreground break-words w-full">
					{title}
				</h2>
			</div>
			{children}
		</div>
	);
};
