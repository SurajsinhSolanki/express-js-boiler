import client from 'prom-client';

export const restResponseTimeHistogram = new client.Histogram({
  name: 'rest_response_time_duration_seconds',
  help: 'REST API response time in seconds',
  labelNames: ['method', 'route', 'status_code']
});

export const databaseResponseTimeHistogram = new client.Histogram({
  name: 'db_response_time_duration_seconds',
  help: 'Database response time in seconds',
  labelNames: ['operation', 'success']
});

export function startMetricsServer() {
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  // You can expose the metrics endpoint in your server.ts or a dedicated metrics server
  // For now, we'll just ensure default metrics are collected.
  // The actual endpoint will be added in server.ts
}
