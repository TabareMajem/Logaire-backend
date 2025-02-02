import { Alert, HealthStatus, Metric, MonitoringConfig } from '@/types/monitoring';

class MonitoringService {
  private static instance: MonitoringService;
  private baseUrl = '/api/monitoring';

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!this.instance) {
      this.instance = new MonitoringService();
    }
    return this.instance;
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch health status');
    }

    return response.json();
  }

  async startMonitoring(interval: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action: 'start', interval }),
    });

    if (!response.ok) {
      throw new Error('Failed to start monitoring');
    }
  }

  async stopMonitoring(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action: 'stop' }),
    });

    if (!response.ok) {
      throw new Error('Failed to stop monitoring');
    }
  }

  async updateMonitoringConfig(config: Partial<MonitoringConfig>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to update monitoring configuration');
    }
  }

  async getMetrics(params: {
    type: string;
    from?: Date;
    to?: Date;
  }): Promise<Metric[]> {
    const queryParams = new URLSearchParams({
      type: params.type,
      ...(params.from && { from: params.from.toISOString() }),
      ...(params.to && { to: params.to.toISOString() })
    });

    const response = await fetch(
      `${this.baseUrl}/metrics?${queryParams}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    return response.json();
  }

  async recordMetrics(metrics: Partial<Metric>[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/metrics`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ metrics }),
    });

    if (!response.ok) {
      throw new Error('Failed to record metrics');
    }
  }

  async getAlerts(params?: {
    status?: string;
    severity?: string;
  }): Promise<Alert[]> {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(
      `${this.baseUrl}/alerts?${queryParams}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    return response.json();
  }

  async createAlert(alert: Partial<Alert>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ alert }),
    });

    if (!response.ok) {
      throw new Error('Failed to create alert');
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ id: alertId, action: 'acknowledge' }),
    });

    if (!response.ok) {
      throw new Error('Failed to acknowledge alert');
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ id: alertId, action: 'resolve' }),
    });

    if (!response.ok) {
      throw new Error('Failed to resolve alert');
    }
  }

  private getHeaders(): HeadersInit {
    // Get token from auth context/storage
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
}

export const monitoringService = MonitoringService.getInstance(); 