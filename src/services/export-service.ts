import { Alert, HealthCheck, Metric } from '@/types/monitoring';

class ExportService {
  private static instance: ExportService;

  private constructor() {}

  static getInstance(): ExportService {
    if (!this.instance) {
      this.instance = new ExportService();
    }
    return this.instance;
  }

  async exportMetricsToCSV(metrics: Metric[]): Promise<void> {
    const headers = ['Timestamp', 'Type', 'Value', 'Metadata'];
    const rows = metrics.map(metric => [
      new Date(metric.timestamp).toISOString(),
      metric.type,
      metric.value.toString(),
      JSON.stringify(metric.metadata || {})
    ]);

    this.downloadCSV('metrics_export.csv', headers, rows);
  }

  async exportAlertsToCSV(alerts: Alert[]): Promise<void> {
    const headers = ['ID', 'Timestamp', 'Status', 'Severity', 'Message'];
    const rows = alerts.map(alert => [
      alert.id,
      new Date(alert.timestamp).toISOString(),
      alert.status,
      alert.severity,
      alert.message
    ]);

    this.downloadCSV('alerts_export.csv', headers, rows);
  }

  async exportHealthChecksToCSV(checks: HealthCheck[]): Promise<void> {
    const headers = ['Component', 'Status', 'Latency', 'Error Rate', 'Last Check', 'Message'];
    const rows = checks.map(check => [
      check.component,
      check.status,
      check.latency?.toString() || '',
      check.errorRate?.toString() || '',
      new Date(check.lastCheck).toISOString(),
      check.message || ''
    ]);

    this.downloadCSV('health_checks_export.csv', headers, rows);
  }

  private downloadCSV(filename: string, headers: string[], rows: string[][]): void {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportToJSON(data: any, filename: string): Promise<void> {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const exportService = ExportService.getInstance(); 