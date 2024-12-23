import FrontendTracer from "@/clientTelemetry.js";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";

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

// It's the layout component
export const Route = createRootRoute({
	component: () => (
		<>
			<Outlet />
			<FrontendTracer />
			<TanStackRouterDevtoolsForDev />
		</>
	),
	notFoundComponent: () => <div>Not Found</div>,
});
