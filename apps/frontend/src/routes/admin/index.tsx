import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
	component: Dashboard, // This is the main
});

function Dashboard() {
	return (
		<div className="w-full h-full overflow-auto bg-background rounded-2xl text-foreground">
			<div className="flex w-full h-full justify-between items-center p-3">
				<span className="text-gray-800">
					<h2 className="text-3xl font-semibold"> Welcome to TutoriaLLM </h2>
					Admin Dashboard
				</span>
				<img src="/logo.svg" alt="logo" className="max-w-48 aspect-square" />
			</div>
			<div className="w-full h-full p-3 flex flex-col gap-3">
				<Link
					to="/admin/tutorials"
					className="bg-card border shadow-lg rounded-2xl p-2 px-4 col-span-3 flex justify-between items-center group hover:bg-card/80 transition-all max-w-xl"
				>
					<span className="w-full text-left">
						<h2 className="text-3xl font-semibold">Tutorials </h2>
						<p className="text-gray-600 ml-auto">
							Information for created tutorials
						</p>
					</span>
					<ArrowRight />
				</Link>
				<Link
					to="/admin/sessions"
					className="bg-card border shadow-lg rounded-2xl p-2 px-4 col-span-3 flex justify-between items-center group hover:bg-card/80 transition-all max-w-xl"
				>
					<span className="w-full text-left">
						<h2 className="text-3xl font-semibold"> Sessions </h2>
						<p className="text-gray-600 ml-auto"> Information for sessions</p>
					</span>
					<ArrowRight />
				</Link>

				<Link
					to="/admin/training"
					className="bg-card border shadow-lg rounded-2xl p-2 px-4 col-span-3 flex justify-between items-center group hover:bg-card/80 transition-all max-w-xl"
				>
					<span className="w-full text-left">
						<h2 className="text-3xl font-semibold"> AI Training </h2>
						<p className="text-gray-600 ml-auto"> Information for Trained AI</p>
					</span>
					<ArrowRight />
				</Link>
			</div>
		</div>
	);
}
