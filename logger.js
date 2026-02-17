"use strict";
const process = require("process");
const opentelemetry = require("@opentelemetry/sdk-node");
const {
	getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
	OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");

/** @type {string: any} */
const pack = require("./package.json");

const sdk = new opentelemetry.NodeSDK({
	traceExporter: new OTLPTraceExporter({}),
	instrumentations: [
		getNodeAutoInstrumentations(),
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-fs": { enabled: true },
			"@opentelemetry/instrumentation-http": { enabled: true },
			"@opentelemetry/instrumentation-dns": { enabled: true },
			"@opentelemetry/instrumentation-runtime-node": { enabled: true },
			"@opentelemetry/instrumentation-undici": { enabled: true },
		}),
	],
	resource: resourceFromAttributes({
		[ATTR_SERVICE_NAME]: pack.name,
	}),
});

global.sdk = sdk;

sdk.start();

process.on("SIGTERM", () => {
	sdk.shutdown()
		.then(() => console.log("Tracing terminated"))
		.catch(error => console.log("Error terminating tracing", error))
		.finally(() => process.exit(0));
});

/** @todo [FIXME] */
// const {
// 	LoggerProvider,
// 	BatchLogRecordProcessor,
// } = require("@opentelemetry/sdk-logs");
// const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
// require("@opentelemetry/api-logs");

// const logger = new LoggerProvider({
// 	resource: resourceFromAttributes({
// 		[ATTR_SERVICE_NAME]: pack.name,
// 	}),
// 	processors: [new BatchLogRecordProcessor(new OTLPLogExporter({}))],
// }).getLogger(pack.name, pack.version);

// const originalConsole = {
// 	log: console.log,
// 	info: console.info,
// 	warn: console.warn,
// 	error: console.error,
// 	debug: console.debug,
// };
// const SeverityNumber = {
// 	DEBUG: 5,
// 	INFO: 9,
// 	WARN: 13,
// 	ERROR: 17,
// };

// console.log = function (...args) {
// 	const message = args
// 		.map(arg =>
// 			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
// 		)
// 		.join(" ");
// 	logger.emit({
// 		severityNumber: SeverityNumber.INFO,
// 		severityText: "INFO",
// 		body: message,
// 		attributes: {},
// 	});
// 	originalConsole.log.apply(console, args);
// };
// console.info = function (...args) {
// 	const message = args
// 		.map(arg =>
// 			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
// 		)
// 		.join(" ");
// 	logger.emit({
// 		severityNumber: SeverityNumber.INFO,
// 		severityText: "INFO",
// 		body: message,
// 		attributes: {},
// 	});
// 	originalConsole.info.apply(console, args);
// };
// console.warn = function (...args) {
// 	const message = args
// 		.map(arg =>
// 			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
// 		)
// 		.join(" ");
// 	logger.emit({
// 		severityNumber: SeverityNumber.WARN,
// 		severityText: "WARN",
// 		body: message,
// 		attributes: {},
// 	});
// 	originalConsole.warn.apply(console, args);
// };
// console.error = function (...args) {
// 	const message = args
// 		.map(arg =>
// 			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
// 		)
// 		.join(" ");
// 	logger.emit({
// 		severityNumber: SeverityNumber.ERROR,
// 		severityText: "ERROR",
// 		body: message,
// 		attributes: {},
// 	});
// 	originalConsole.error.apply(console, args);
// };

// console.debug = function (...args) {
// 	const message = args
// 		.map(arg =>
// 			typeof arg === "object" ? JSON.stringify(arg) : String(arg),
// 		)
// 		.join(" ");
// 	logger.emit({
// 		severityNumber: SeverityNumber.DEBUG,
// 		severityText: "DEBUG",
// 		body: message,
// 		attributes: {},
// 	});
// 	originalConsole.debug.apply(console, args);
// };
