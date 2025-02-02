import { supabase } from '@/lib/supabase/client';
import os from 'os';
import { SystemMetrics } from '../types';

export class SystemMetricsCollector {
  private static instance: SystemMetricsCollector;
  private collectionInterval: NodeJS.Timer | null = null;
  private readonly COLLECTION_INTERVAL = 5000; // 5 seconds

  private constructor() {}

  static getInstance(): SystemMetricsCollector {
    if (!this.instance) {
      this.instance = new SystemMetricsCollector();
    }
    return this.instance;
  }

  startCollection(): void {
    if (this.collectionInterval) return;

    this.collectionInterval = setInterval(
      () => this.collectMetrics(),
      this.COLLECTION_INTERVAL
    );
  }

  stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    const metrics: SystemMetrics = {
      cpuUsage: this.getCPUUsage(),
      memoryUsage: this.getMemoryUsage(),
      activeAgents: await this.getActiveAgents(),
      queuedTasks: await this.getQueuedTasks(),
      activeConnections: await this.getActiveConnections()
    };

    await this.persistMetrics(metrics);
    await this.broadcastMetrics(metrics);
  }

  private getCPUUsage(): number {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce(
      (acc, cpu) => 
        acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle,
      0
    );
    return 1 - totalIdle / totalTick;
  }

  private getMemoryUsage(): number {
    const used = os.totalmem() - os.freemem();
    return used / os.totalmem();
  }

  private async getActiveAgents(): Promise<number> {
    const { count } = await supabase
      .from('agent_registry')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    return count || 0;
  }

  private async getQueuedTasks(): Promise<number> {
    const { count } = await supabase
      .from('task_queue')
      .select('*', { count: 'exact' })
      .eq('status', 'queued');

    return count || 0;
  }

  private async getActiveConnections(): Promise<number> {
    // Implementation depends on your connection tracking mechanism
    return 0;
  }

  private async persistMetrics(metrics: SystemMetrics): Promise<void> {
    const { error } = await supabase
      .from('system_metrics')
      .insert({
        ...metrics,
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to persist system metrics:', error);
    }
  }

  private async broadcastMetrics(metrics: SystemMetrics): Promise<void> {
    // This will be implemented when we set up the WebSocket server
  }
} 