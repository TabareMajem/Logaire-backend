import { ErrorLogger } from '@/lib/errors/logger';
import { MetricType } from '@/types/monitoring';
import { EventEmitter } from 'events';

export interface AgentConfig {
  id: string;
  name: string;
  metricTypes: MetricType[];
  interval: number;
  enabled: boolean;
}

export interface MetricData {
  type: MetricType;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export abstract class MonitoringAgent extends EventEmitter {
  protected config: AgentConfig;
  protected isRunning: boolean = false;
  protected collectionTimer: NodeJS.Timer | null = null;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
  }

  abstract collectMetrics(): Promise<MetricData[]>;

  async start(): Promise<void> {
    if (this.isRunning || !this.config.enabled) return;

    try {
      this.isRunning = true;
      await this.startCollection();
      this.emit('started', { agentId: this.config.id });
    } catch (error) {
      this.isRunning = false;
      ErrorLogger.error(`Failed to start agent ${this.config.id}:`, error as Error);
      this.emit('error', { agentId: this.config.id, error });
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.collectionTimer) {
      // clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }

    this.isRunning = false;
    this.emit('stopped', { agentId: this.config.id });
  }

  protected async startCollection(): Promise<void> {
    // Initial collection
    await this.collect();

    // Schedule regular collection
    this.collectionTimer = setInterval(
      () => this.collect(),
      this.config.interval
    );
  }

  private async collect(): Promise<void> {
    try {
      const metrics = await this.collectMetrics();
      this.emit('metrics', { agentId: this.config.id, metrics });
    } catch (error) {
      ErrorLogger.error(`Metrics collection failed for agent ${this.config.id}:`, error as Error);
      this.emit('collectionError', { agentId: this.config.id, error });
    }
  }

  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('configUpdated', { agentId: this.config.id, config: this.config });
  }

  getStatus(): { isRunning: boolean; lastCollection?: Date } {
    return {
      isRunning: this.isRunning
    };
  }
} 