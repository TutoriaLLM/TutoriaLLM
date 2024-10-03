import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";
import type { AppConfig } from "../type.js";

const FrontendTracer = async () => {
	async function fetchConfig(): Promise<AppConfig> {
		try {
			const response = await fetch("/api/admin/config/");
			const data = (await response.json()) as AppConfig;
			return data;
		} catch (error) {
			console.error("Failed to fetch config:", error);
		}
		return {} as AppConfig;
	}

	const config = await fetchConfig();

	const sentrysetting = config.Client_Sentry_Settings;

	if (
		sentrysetting.Sentry_DSN !== "" &&
		sentrysetting.Sentry_DSN !== undefined
	) {
		console.log("sentry is enabled");
		Sentry.init({
			dsn: sentrysetting.Sentry_DSN,
			tracesSampleRate: sentrysetting.tracesSampleRate,
			replaysOnErrorSampleRate: sentrysetting.replaysOnErrorSampleRate,
			replaysSessionSampleRate: sentrysetting.replaysSessionSampleRate,
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
	} else {
		console.log("sentry is disabled");
	}
};

export default FrontendTracer;
