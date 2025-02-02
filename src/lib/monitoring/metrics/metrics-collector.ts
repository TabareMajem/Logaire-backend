import { cacheManager } from '@/lib/cache/cache-manager';
import { dbManager } from '@/lib/database/connection-manager';
import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';

export type MetricType = 
  | 'agent_performance'
  | 'workflow_execution'
  | 'document_processing'
  | 'system_health'
  | 'api_latency'
  | 'resource_usage';

interface MetricData {
  type: MetricType;
  timestamp: string;
  value: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

interface MetricQuery {
  type: MetricType;
  startTime?: string;
  endTime?: string;
  tags?: Record<string, string>;
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  interval?: string;
}

export class MetricsCollector extends EventEmitter {
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL = 10000; // 10 seconds
  private metricsBatch: Map<MetricType, MetricData[]>;
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.metricsBatch = new Map();
    this.startPeriodicFlush();
  }

  async recordMetric(
    type: MetricType,
    value: number,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const metric: MetricData = {
        type,
        timestamp: new Date().toISOString(),
        value,
        tags,
        metadata
      };

      let batch = this.metricsBatch.get(type) || [];
      batch.push(metric);
      this.metricsBatch.set(type, batch);

      if (batch.length >= this.BATCH_SIZE) {
        await this.flushMetricType(type);
      }
      // Emit real-time metric for live monitoring
      this.emit('metric', metric);
    } catch (error) {
      ErrorLogger.error('Error recording metric:', error as Error); 
    }
  }

  async queryMetrics(query: MetricQuery): Promise<MetricData[]> {
    try {
      const { type, startTime, endTime, tags, aggregation, interval } = query;
      
      let sql = `
        SELECT 
          ${this.buildTimeSeriesSelector(interval)}
          ${this.buildAggregationSelector(aggregation)}
        FROM metrics
        WHERE type = $1
      `;

      const params: any[] = [type];
      let paramIndex = 2;

      if (startTime) {
        sql += ` AND timestamp >= $${paramIndex++}`;
        params.push(startTime);
      }

      if (endTime) {
        sql += ` AND timestamp <= $${paramIndex++}`;
        params.push(endTime);
      }

      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          sql += ` AND tags->>'${key}' = $${paramIndex++}`;
          params.push(value);
        });
      }

      if (interval) {
        sql += ` GROUP BY time_bucket`;
      }

      sql += ` ORDER BY timestamp DESC`;
      const result = await dbManager.query<MetricData[]>(sql, params);
      return result;
    } catch (error) {
      ErrorLogger.error('Error querying metrics:', error as Error);
      throw error;
    }
  }

  async getRealtimeMetrics(type: MetricType): Promise<MetricData[]> {
    try {
      const cacheKey = `realtime-metrics:${type}`;
      const cached = await cacheManager.get<MetricData[]>(cacheKey);
      if (cached) return cached;

      const metrics = await this.queryMetrics({
        type,
        startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
        interval: '1m'
      });

      await cacheManager.set(cacheKey, metrics, 60); // Cache for 1 minute
      return metrics;
    } catch (error) {
      ErrorLogger.error('Error getting realtime metrics:', error as Error);
      return [];
    }
  }

  private async flushMetricType(type: MetricType): Promise<void> {
    const batch = this.metricsBatch.get(type) || [];
    if (batch.length === 0) return;

    try {
      await dbManager.transaction(async (client) => {
        const sql = `
          INSERT INTO metrics (type, timestamp, value, tags, metadata)
          VALUES ($1, $2, $3, $4, $5)
        `;

        const promises = batch.map(metric =>
          client.query(sql, [
            type,
            metric.timestamp,
            metric.value,
            metric.tags,
            metric.metadata
          ])
        );

        await Promise.all(promises);
      });

      this.metricsBatch.delete(type);
    } catch (error) {
      ErrorLogger.error('Error flushing metrics:', error as Error);
    }
  }

  private async flushAllMetrics(): Promise<void> {
    try {
      const types = Array.from(this.metricsBatch.keys());
      await Promise.all(types.map(type => this.flushMetricType(type)));
    } catch (error) {
      ErrorLogger.error('Error flushing all metrics:', error as Error);
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimeout = setInterval(
      () => this.flushAllMetrics(),
      this.FLUSH_INTERVAL
    );
  }

  private buildTimeSeriesSelector(interval?: string): string {
    if (!interval) return 'timestamp,';
    return `time_bucket('${interval}', timestamp) as time_bucket,`;
  }

  private buildAggregationSelector(aggregation?: string): string {
    if (!aggregation) return 'value, tags, metadata';
    
    switch (aggregation) {
      case 'avg':
        return 'AVG(value) as value';
      case 'sum':
        return 'SUM(value) as value';
      case 'min':
        return 'MIN(value) as value';
      case 'max':
        return 'MAX(value) as value';
      case 'count':
        return 'COUNT(*) as value';
      default:
        return 'value';
    }
  }

  async cleanup(): Promise<void> {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
    }
    await this.flushAllMetrics();
  }
}

export const metricsCollector = new MetricsCollector(); 