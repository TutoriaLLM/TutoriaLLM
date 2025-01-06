import FrontendTracer from "@/clientTelemetry.js";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";
import { Toaster } from "@/components/ui/toaster";

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
			<Toaster />
			<FrontendTracer />
			<TanStackRouterDevtoolsForDev />
		</>
	),
	notFoundComponent: () => <div>Not Found</div>,
});
