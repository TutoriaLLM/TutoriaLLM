import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import GA4 from "react-ga4";
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";
import { getConfig } from "./api/config.js";

const FrontendTracer = () => {
	const pageLocation = useLocation();

	const ReactGA = GA4; // typeが壊れていたので応急処置

	useEffect(() => {
		// 非同期処理をuseEffect内で行う
		const initializeAnalyticsAndSentry = async () => {
			const config = await getConfig();
			// Google Analyticsの設定
			console.log(
				"Google Analytics Tracking ID:",
				config.Client_Settings.GA_Tracking_ID,
			);
			const id = config.Client_Settings.GA_Tracking_ID;
			if (id && id !== "") {
				console.log("Google Analytics is enabled");
				ReactGA.initialize(id);
				ReactGA.send({
					hitType: "pageview",
					page: pageLocation.pathname + pageLocation.search,
				});
			}

			// Sentryの設定
			const sentrysetting = config.Client_Sentry_Settings;
			if (sentrysetting.Sentry_DSN) {
				Sentry.init({
					dsn: sentrysetting.Sentry_DSN,
					tracesSampleRate: sentrysetting.tracesSampleRate || 0,
					replaysOnErrorSampleRate: sentrysetting.replaysOnErrorSampleRate || 0,
					replaysSessionSampleRate: sentrysetting.replaysSessionSampleRate || 0,
					integrations: [
						Sentry.reactRouterV6BrowserTracingIntegration({
							useEffect,
							useLocation,
							useNavigationType,
							createRoutesFromChildren,
							matchRoutes,
						}),
						Sentry.replayIntegration({
							maskAllText: false,
						}),
					],
				});
			} else {
				console.log("Sentry is disabled");
			}
		};

		initializeAnalyticsAndSentry();
	}, [pageLocation]);

	return null; // このコンポーネントはUIを持たないので、何も返さない
};

export default FrontendTracer;
