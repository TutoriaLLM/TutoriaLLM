import { getConfig } from "@/api/config";
import * as Sentry from "@sentry/react";
import { useLocation, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import GA4 from "react-ga4";

const FrontendTracer = () => {
	const router = useRouter();
	const pageLocation = useLocation();

	const ReactGA = GA4; // Type was broken, so first aid was required.

	useEffect(() => {
		// Asynchronous processing in useEffect
		const initializeAnalyticsAndSentry = async () => {
			const config = await getConfig();

			const id = config.Client_Settings.GA_Tracking_ID;
			if (id && id !== "") {
				console.info("Google Analytics is enabled");
				ReactGA.initialize(id);
				ReactGA.send({
					hitType: "pageview",
					page: pageLocation.pathname + pageLocation.search,
				});
			}

			// Sentry Configuration
			const sentrysetting = config.Client_Sentry_Settings;
			if (sentrysetting.Sentry_DSN) {
				Sentry.init({
					dsn: sentrysetting.Sentry_DSN,
					tracesSampleRate: sentrysetting.tracesSampleRate || 0,
					replaysOnErrorSampleRate: sentrysetting.replaysOnErrorSampleRate || 0,
					replaysSessionSampleRate: sentrysetting.replaysSessionSampleRate || 0,
					integrations: [
						Sentry.tanstackRouterBrowserTracingIntegration(router),
						Sentry.replayIntegration({
							maskAllText: false,
						}),
					],
				});
			} else {
				console.info("Sentry is disabled");
			}
		};

		initializeAnalyticsAndSentry();
	}, [pageLocation]);

	return null; // This component has no UI and returns nothing
};

export default FrontendTracer;
