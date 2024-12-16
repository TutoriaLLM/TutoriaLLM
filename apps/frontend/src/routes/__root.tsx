import FrontendTracer from "@/clientTelemetry.js";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// It's the layout component
export const Route = createRootRoute({
	component: () => (
		<>
			<Outlet />
			<FrontendTracer />
			<TanStackRouterDevtools />
		</>
	),
});
