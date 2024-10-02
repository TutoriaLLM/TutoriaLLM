import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";

const FrontendTracer = async () => {
	console.log("FrontendTracer", import.meta.env.VITE_FRONT_SENTRY_DSN);
	if (import.meta.env.VITE_FRONT_SENTRY_DSN) {
		Sentry.init({
			dsn: import.meta.env.VITE_FRONT_SENTRY_DSN,
			tracesSampleRate: 1.0,
			integrations: [
				Sentry.reactRouterV6BrowserTracingIntegration({
					useEffect,
					useLocation,
					useNavigationType,
					createRoutesFromChildren,
					matchRoutes,
				}),
				Sentry.replayIntegration(),
			],
		});
	}
};

export default FrontendTracer;
