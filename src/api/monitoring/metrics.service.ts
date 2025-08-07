import client from 'prom-client';

class MetricsService {
  private register = new client.Registry();

  // Metrics
  public httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [this.register]
  });

  public httpErrors = new client.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.register]
  });

  public dbQueryDuration = new client.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of DB queries',
    labelNames: ['operation', 'success'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
    registers: [this.register]
  });

  public memoryUsage = new client.Gauge({
    name: 'node_memory_bytes',
    help: 'Memory usage of the Node.js process',
    labelNames: ['type'],
    registers: [this.register]
  });

  public cpuUsage = new client.Gauge({
    name: 'node_cpu_microseconds',
    help: 'CPU usage of the Node.js process',
    labelNames: ['type'],
    registers: [this.register]
  });

  constructor() {
    client.collectDefaultMetrics({ register: this.register });
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
    if (statusCode >= 400) {
      this.httpErrors.inc({ method, route, status_code: statusCode.toString() });
    }
  }

  public recordHttpError(method: string, route: string, statusCode: number): void {
    this.httpErrors.inc({
      method,
      route,
      status_code: statusCode.toString()
    });
  }

  recordDbQuery(operation: string, duration: number, success: boolean) {
    this.dbQueryDuration.observe({ operation, success: success.toString() }, duration);
  }

  updateSystemMetrics() {
    const mem = process.memoryUsage();
    Object.entries(mem).forEach(([key, value]) => {
      this.memoryUsage.set({ type: key }, value);
    });

    const cpu = process.cpuUsage();
    this.cpuUsage.set({ type: 'user' }, cpu.user);
    this.cpuUsage.set({ type: 'system' }, cpu.system);
  }

  getContentType() {
    return this.register.contentType;
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }
}

export const metricsService = new MetricsService();
