import { getConfig } from "@/api/config";
import * as Sentry from "@sentry/react";
import { useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import GA4 from "react-ga4";

const FrontendTracer = () => {
	const router = useRouter();
	const pageLocation = useLocation();
	const isSentryInitialized = useRef(false); // Sentry初期化状態を追跡

	const ReactGA = GA4; // Type was broken, so first aid was required.

	useEffect(() => {
		// Asynchronous processing in useEffect
		const initializeAnalyticsAndSentry = async () => {
			const config = await getConfig();

			// Google Analytics Configuration
			const id = config.Client_Settings.GA_Tracking_ID;
			if (id && id !== "") {
				console.info("Google Analytics is enabled");
				ReactGA.initialize(id);
				ReactGA.send({
					hitType: "pageview",
					page: pageLocation.pathname + pageLocation.search,
				});
			}

			// Sentry Configuration (prevent multiple initializations)
			if (!isSentryInitialized.current) {
				const sentrySetting = config.Client_Sentry_Settings;
				if (sentrySetting.Sentry_DSN) {
					Sentry.init({
						dsn: sentrySetting.Sentry_DSN,
						tracesSampleRate: sentrySetting.tracesSampleRate || 0,
						replaysOnErrorSampleRate:
							sentrySetting.replaysOnErrorSampleRate || 0,
						replaysSessionSampleRate:
							sentrySetting.replaysSessionSampleRate || 0,
						integrations: [
							Sentry.tanstackRouterBrowserTracingIntegration(router),
							Sentry.replayIntegration({
								maskAllText: false,
							}),
						],
					});
					isSentryInitialized.current = true; // 初期化済みフラグを設定
					console.info("Sentry initialized");
				} else {
					console.info("Sentry is disabled");
				}
			}
		};

		initializeAnalyticsAndSentry();
	}, [pageLocation]);

	return null; // This component has no UI and returns nothing
};

export default FrontendTracer;
