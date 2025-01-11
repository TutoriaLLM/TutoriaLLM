import { createFileRoute, redirect } from "@tanstack/react-router";
import TutorialEditor from "@/components/features/admin/TutorialEditor";
import { queryOptions } from "@tanstack/react-query";
import { getSpecificTutorial } from "@/api/admin/tutorials";

const tutorialQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["tutorials", id],
		queryFn: () => getSpecificTutorial({ id }),
	});
export const Route = createFileRoute("/admin/tutorials_/$id_/edit")({
	component: RouteComponent,
	beforeLoad: ({ params, context: { queryClient } }) => ({
		getTutorialData: async () => {
			const data = await queryClient.ensureQueryData(
				tutorialQueryOptions(params.id),
			);
			return data;
		},
	}),
	loader: async ({ context: { getTutorialData } }) => {
		return await getTutorialData();
	},
	shouldReload: true,
	onError: (e) => {
		console.error("Failed to load tutorial detail", e);
		throw redirect({
			to: "/admin/tutorials",
		});
	},
});

function RouteComponent() {
	const tutorial = Route.useLoaderData();
	return (
		<div className="">
			<TutorialEditor tutorial={tutorial} />
		</div>
	);
}
