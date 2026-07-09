"use strict";
const process = require("process");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
	getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
	OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const {
	ATTR_SERVICE_NAME,
	ATTR_HTTP_RESPONSE_HEADER,
	ATTR_HTTP_RESPONSE_STATUS_CODE,
	ATTR_HTTP_REQUEST_RESEND_COUNT,
} = require("@opentelemetry/semantic-conventions");
const { trace, SpanStatusCode } = require("@opentelemetry/api");
Object.assign(global, {
	trace,
	SpanStatusCode,
	ATTR_HTTP_RESPONSE_HEADER,
	ATTR_HTTP_RESPONSE_STATUS_CODE,
	ATTR_HTTP_REQUEST_RESEND_COUNT,
});
const { logs, SeverityNumber } = require("@opentelemetry/api-logs");
/** @type {string: any} */
const pack = require("./package.json");
const { BatchLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const resource = resourceFromAttributes({
	[ATTR_SERVICE_NAME]: pack.name,
});
const originalConsole = { ...console };
const sdk = new NodeSDK({
	traceExporter: new OTLPTraceExporter({}),
	logRecordProcessors: [
		new BatchLogRecordProcessor({
			exporter: new OTLPLogExporter({}),
		}),
	],
	instrumentations: [getNodeAutoInstrumentations()],
	resource,
});
const originalShutdown = sdk.shutdown.bind(sdk);
let shutdownPromise;
sdk.shutdown = async function () {
	if (shutdownPromise) return shutdownPromise;
	shutdownPromise = originalShutdown(...arguments).catch(console.error);
};
process.on("SIGTERM", () => {
	sdk.shutdown()
		.then(() => originalConsole.log("OpenTelemetry terminated"))
		.finally(() => process.exit(0));
});
global.sdk = sdk;

sdk.start();

const logger = logs.getLogger(pack.name, pack.version);
console.debug = function (...args) {
	const body = args
		.map(arg =>
			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
		)
		.join(" ");
	logger.emit({
		severityNumber: SeverityNumber.DEBUG,
		severityText: "DEBUG",
		body,
	});
	originalConsole.debug.apply(this, args);
};
console.log = function (...args) {
	const body = args
		.map(arg =>
			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
		)
		.join(" ");
	logger.emit({
		severityNumber: SeverityNumber.INFO,
		severityText: "LOG",
		body,
	});
	originalConsole.log.apply(this, args);
};
console.info = function (...args) {
	const body = args
		.map(arg =>
			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
		)
		.join(" ");
	logger.emit({
		severityNumber: SeverityNumber.INFO2,
		severityText: "INFO",
		body,
	});
	originalConsole.info.apply(this, args);
};
console.warn = function (...args) {
	const body = args
		.map(arg =>
			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
		)
		.join(" ");
	logger.emit({
		severityNumber: SeverityNumber.WARN,
		severityText: "WARN",
		body,
	});
	originalConsole.warn.apply(this, args);
};
console.error = function (...args) {
	const body = args
		.map(arg =>
			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
		)
		.join(" ");
	logger.emit({
		severityNumber: SeverityNumber.ERROR,
		severityText: "ERROR",
		body,
	});
	originalConsole.error.apply(this, args);
};
