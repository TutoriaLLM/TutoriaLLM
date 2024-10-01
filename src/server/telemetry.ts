//sentry support with opentelemetry

import Sentry from "@sentry/node";
import { GenericPoolInstrumentation } from "@opentelemetry/instrumentation-generic-pool";

import * as opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";

// Make sure to call "Sentry.init" BEFORE initializing the OpenTelemetry SDK
Sentry.init({
	dsn: process.env.SENTRY_DSN,
	tracesSampleRate: 1.0,
});

Sentry.addOpenTelemetryInstrumentation(new GenericPoolInstrumentation());

// Sentryが有効でない場合は、ローカルでのテレメトリを利用するため、OpenTelemetry SDKを初期化する
if (!process.env.SENTRY_DSN) {
	const sdk = new opentelemetry.NodeSDK({
		resource: new Resource({
			"service.name": "tutoriallm",
		}),
		traceExporter: new OTLPTraceExporter({
			url: process.env.TELEMETRY_EXPORT_URL || undefined,
		}),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter({
				url: process.env.TELEMETRY_EXPORT_URL || undefined,
			}),
		}),
		instrumentations: [getNodeAutoInstrumentations()],
	});

	sdk.start();
}
