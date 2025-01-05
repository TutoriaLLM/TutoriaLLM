import { TutorialsTable } from "@/components/features/admin/tables/tutorials/table";
import { Button } from "@/components/ui/button";
import type { Tutorial } from "@/type.js";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { z } from "zod";

export const tutorialsQuerySchema = z.object({
	page: fallback(z.number(), 1).default(1),
	limit: fallback(z.number(), 10).default(10),
	sortField: fallback(z.string() as z.ZodType<keyof Tutorial>, "id").default(
		"id",
	),
	sortOrder: fallback(z.enum(["asc", "desc"]), "desc").default("desc"),
});

export const Route = createFileRoute("/admin/tutorials")({
	component: Tutorials, // This is the main
	shouldReload: true,
	validateSearch: zodValidator(tutorialsQuerySchema),
});

function Tutorials() {
	// const [tutorials, setTutorials] = useState<Tutorial[]>([]);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();

	if (error) {
		alert(error);
		setError(null); // Reset error and continue display
	}

	return (
		<div className="overflow-clip">
			<div className="overflow-x-auto max-w-screen p-2 md:p-4">
				<TutorialsTable />
			</div>

			<div className="p-2 border-b-2 border-gray-300 bg-gray-300 flex flex-col items-center gap-2 w-full">
				<h2 className="font-semibold">Create New Tutorial</h2>
				<Button
					onClick={() =>
						router.navigate({
							to: "/admin/tutorials/new",
						})
					}
				>
					Create New Tutorial
				</Button>
			</div>
		</div>
	);
}
