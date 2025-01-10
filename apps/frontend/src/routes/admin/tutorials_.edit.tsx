import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import TutorialEditor from "@/components/features/admin/TutorialEditor";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSpecificTutorial } from "@/api/admin/tutorials";

const editTargetSchema = z.object({
	id: z.number(),
});

const tutorialQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ["tutorials", id],
		queryFn: () => getSpecificTutorial({ id }),
	});
export const Route = createFileRoute("/admin/tutorials_/edit")({
	component: RouteComponent,
	validateSearch: editTargetSchema,
	beforeLoad: ({ search }) => ({
		search: search,
	}),
	loader: async ({ context: { search, queryClient } }) => {
		async function getTutorialData() {
			if (!search.id) {
				return null;
			}
			const tutorial = await queryClient.ensureQueryData(
				tutorialQueryOptions(search.id),
			);
			return tutorial;
		}
		return await getTutorialData();
	},
	shouldReload: true,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data: tutorial } = useSuspenseQuery(tutorialQueryOptions(search.id));
	return (
		<div className="">
			<TutorialEditor tutorial={tutorial || null} />
		</div>
	);
}
