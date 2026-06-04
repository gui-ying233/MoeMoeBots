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
} = require("@opentelemetry/semantic-conventions");
const { trace, SpanStatusCode } = require("@opentelemetry/api");
Object.assign(global, {
	trace,
	SpanStatusCode,
	ATTR_HTTP_RESPONSE_HEADER,
	ATTR_HTTP_RESPONSE_STATUS_CODE,
});
const { SeverityNumber } = require("@opentelemetry/api-logs");
/** @type {string: any} */
const pack = require("./package.json");
const {
	LoggerProvider,
	BatchLogRecordProcessor,
} = require("@opentelemetry/sdk-logs");
const resource = resourceFromAttributes({
	[ATTR_SERVICE_NAME]: pack.name,
});
const loggerProvider = new LoggerProvider({
	resource,
	processors: [new BatchLogRecordProcessor(new OTLPLogExporter({}))],
});
const logger = loggerProvider.getLogger(pack.name, pack.version);

const originalConsole = { ...console };
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

const sdk = new NodeSDK({
	traceExporter: new OTLPTraceExporter({}),
	instrumentations: [getNodeAutoInstrumentations()],
	resource,
});
const originalShutdown = sdk.shutdown;
sdk.shutdown = async function () {
	return await Promise.allSettled([
		loggerProvider
			.shutdown()
			.catch(error => console.log("Error terminating logging", error)),
		originalShutdown
			.apply(this, arguments)
			.catch(error => console.log("Error terminating tracing", error)),
	]);
};
process.on("SIGTERM", () => {
	sdk.shutdown()
		.then(() => console.log("Tracing terminated"))
		.finally(() => process.exit(0));
});
global.sdk = sdk;

sdk.start();
