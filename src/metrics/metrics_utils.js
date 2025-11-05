const promClient = require('prom-client');

// Optionally collect default metrics (CPU, memory, event loop lag, etc.)
// promClient.collectDefaultMetrics();

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
});

const requestDurationHistogram = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.1, 0.5, 1, 5, 10],
});

const requestDurationSummary = new promClient.Summary({
  name: 'http_request_duration_summary_seconds',
  help: 'Summary of the duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  percentiles: [0.5, 0.9, 0.99],
});

const gauge = new promClient.Gauge({
  name: 'node_gauge_example',
  help: 'Example of a gauge tracking async task duration',
  labelNames: ['method', 'status'],
});

module.exports = {
  httpRequestCounter,
  requestDurationHistogram,
  requestDurationSummary,
  gauge,
  promClient,
};
