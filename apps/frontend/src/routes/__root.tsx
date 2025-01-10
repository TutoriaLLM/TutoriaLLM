import FrontendTracer from "@/clientTelemetry.js";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import type { QueryClient } from "@tanstack/react-query";

const TanStackRouterDevtoolsForDev =
	import.meta.env.MODE === "production" || process.env.NODE_ENV === "production"
		? () => null // Render nothing in production
		: React.lazy(() =>
				// Lazy load in development
				import("@tanstack/router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
					// For Embedded Mode
					// default: res.TanStackRouterDevtoolsPanel
				})),
			);
interface Context {
	queryClient: QueryClient;
}
// It's the layout component
export const Route = createRootRouteWithContext<Context>()({
	component: () => (
		<>
			<Outlet />
			<Toaster />
			<FrontendTracer />
			<TanStackRouterDevtoolsForDev />
		</>
	),
	notFoundComponent: () => <div>Not Found</div>,
});
