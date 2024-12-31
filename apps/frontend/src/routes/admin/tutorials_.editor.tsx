import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import TutorialEditor from "@/components/features/admin/TutorialEditor";
import { BackToPrevPage } from "@/components/features/editor/backPrev";

const editTargetSchema = z.object({
	id: z.number().optional(),
});
export const Route = createFileRoute("/admin/tutorials_/editor")({
	component: RouteComponent,
	validateSearch: editTargetSchema,
	beforeLoad: ({ search }) => {
		if (!search.id) {
			return;
		}
	},
});

function RouteComponent() {
	const search = Route.useSearch();
	return (
		<div>
			<BackToPrevPage />
			<TutorialEditor id={search.id || null} />
		</div>
	);
}
