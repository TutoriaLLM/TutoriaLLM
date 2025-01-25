import { createFileRoute } from "@tanstack/react-router";
import TutorialEditor from "@/components/features/admin/TutorialEditor";

export const Route = createFileRoute("/admin/tutorials_/new")({
	component: RouteComponent,
	shouldReload: true,
});

function RouteComponent() {
	return (
		<div className="">
			<TutorialEditor tutorial={null} />
		</div>
	);
}
