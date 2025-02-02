import * as os from 'os';
import { AgentConfig, MetricData, MonitoringAgent } from './base/monitoring-agent';

export class SystemMetricsAgent extends MonitoringAgent {
  private lastCpuUsage: { user: number; system: number } | null = null;
  private lastCpuTime: number | null = null;

  constructor(config: AgentConfig) {
    super({
      ...config,
      metricTypes: ['cpu', 'memory', 'disk', 'network']
    });
  }

  async collectMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = new Date().toISOString();

    // Collect CPU metrics
    const cpuUsage = await this.getCpuUsage();
    if (cpuUsage !== null) {
      metrics.push({
        type: 'cpu',
        value: cpuUsage,
        timestamp,
        metadata: {
          cores: os.cpus().length
        }
      });
    }

    // Collect memory metrics
    const memoryUsage = this.getMemoryUsage();
    metrics.push({
      type: 'memory',
      value: memoryUsage,
      timestamp,
      metadata: {
        total: os.totalmem(),
        free: os.freemem()
      }
    });

    // Add disk and network metrics if available
    const diskUsage = await this.getDiskUsage();
    if (diskUsage !== null) {
      metrics.push({
        type: 'disk',
        value: diskUsage,
        timestamp,
        metadata: {
          filesystem: '/'
        }
      });
    }

    const networkUsage = await this.getNetworkUsage();
    if (networkUsage !== null) {
      metrics.push({
        type: 'network',
        value: networkUsage,
        timestamp
      });
    }

    return metrics;
  }

  private async getCpuUsage(): Promise<number | null> {
    const cpus = os.cpus();
    const currentTime = Date.now();

    if (!cpus.length) return null;

    const totalCpu = cpus.reduce(
      (acc, cpu) => ({
        user: acc.user + cpu.times.user,
        system: acc.system + cpu.times.system
      }),
      { user: 0, system: 0 }
    );

    if (this.lastCpuUsage === null || this.lastCpuTime === null) {
      this.lastCpuUsage = totalCpu;
      this.lastCpuTime = currentTime;
      return null;
    }

    const userDiff = totalCpu.user - this.lastCpuUsage.user;
    const systemDiff = totalCpu.system - this.lastCpuUsage.system;
    const timeDiff = currentTime - this.lastCpuTime;

    this.lastCpuUsage = totalCpu;
    this.lastCpuTime = currentTime;

    const usage = ((userDiff + systemDiff) / (timeDiff * cpus.length)) * 100;
    return Math.min(100, Math.max(0, usage));
  }

  private getMemoryUsage(): number {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return (used / total) * 100;
  }

  private async getDiskUsage(): Promise<number | null> {
    // Implementation depends on platform
    // This is a placeholder
    return null;
  }

  private async getNetworkUsage(): Promise<number | null> {
    // Implementation depends on platform
    // This is a placeholder
    return null;
  }
} 