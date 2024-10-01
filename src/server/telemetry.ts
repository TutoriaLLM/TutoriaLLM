import * as opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";

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
