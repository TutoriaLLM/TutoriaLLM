//sentry support with opentelemetry

import { GenericPoolInstrumentation } from "@opentelemetry/instrumentation-generic-pool";
import * as Sentry from "@sentry/node";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import * as opentelemetry from "@opentelemetry/sdk-node";

// Make sure to call "Sentry.init" BEFORE initializing the OpenTelemetry SDK
if (process.env.SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0,
		registerEsmLoaderHooks: { onlyIncludeInstrumentedModules: true }, // If you don't add this, some modules will cause errors that will not load.
	});
	Sentry.addOpenTelemetryInstrumentation(new GenericPoolInstrumentation());
}

// If Sentry is not enabled, initialize OpenTelemetry SDK to use local telemetry
if (process.env.TELEMETRY_EXPORT_URL) {
	const sdk = new opentelemetry.NodeSDK({
		resource: new Resource({
			"service.name": "tutoriallm-server",
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
