import { ErrorLogger } from '@/lib/errors/logger';
import { Metric, MetricType } from '@/types/monitoring';
import { websocketService } from './websocket-service';

interface MetricAggregation {
  current: number;
  min: number;
  max: number;
  avg: number;
  count: number;
  lastUpdate: Date;
}

type AggregationWindow = '1m' | '5m' | '15m' | '1h' | '1d';

class MetricsAggregatorService {
  private static instance: MetricsAggregatorService;
  private aggregations: Map<string, Map<AggregationWindow, MetricAggregation>>;
  private subscribers: Map<string, Set<(data: MetricAggregation) => void>>;
  private buffers: Map<string, Metric[]>;
  private flushIntervals: Map<AggregationWindow, NodeJS.Timer>;

  private constructor() {
    this.aggregations = new Map();
    this.subscribers = new Map();
    this.buffers = new Map();
    this.flushIntervals = new Map();
    this.initializeFlushIntervals();
  }

  static getInstance(): MetricsAggregatorService {
    if (!this.instance) {
      this.instance = new MetricsAggregatorService();
    }
    return this.instance;
  }

  private initializeFlushIntervals() {
    const intervals: [AggregationWindow, number][] = [
      ['1m', 60 * 1000],
      ['5m', 5 * 60 * 1000],
      ['15m', 15 * 60 * 1000],
      ['1h', 60 * 60 * 1000],
      ['1d', 24 * 60 * 60 * 1000]
    ];

    intervals.forEach(([window, interval]) => {
      this.flushIntervals.set(window, setInterval(() => {
        this.flushWindow(window);
      }, interval));
    });
  }

  startAggregating(metricType: MetricType): void {
    if (!this.buffers.has(metricType)) {
      this.buffers.set(metricType, []);
      this.aggregations.set(metricType, new Map());

      websocketService.subscribe<Metric>(`metrics:${metricType}`, (metric) => {
        this.processMetric(metricType, metric);
      });
    }
  }

  private processMetric(type: MetricType, metric: Metric): void {
    const buffer = this.buffers.get(type);
    if (!buffer) return;

    buffer.push(metric);
    this.updateAggregations(type, metric);
    this.notifySubscribers(type);
  }

  private updateAggregations(type: MetricType, metric: Metric): void {
    const typeAggregations = this.aggregations.get(type);
    if (!typeAggregations) return;

    typeAggregations.forEach((agg) => {
      agg.current = metric.value;
      agg.min = Math.min(agg.min, metric.value);
      agg.max = Math.max(agg.max, metric.value);
      agg.count++;
      agg.avg = (agg.avg * (agg.count - 1) + metric.value) / agg.count;
      agg.lastUpdate = new Date();
    });
  }

  private flushWindow(window: AggregationWindow): void {
    this.aggregations.forEach((typeAggregations, type) => {
      const buffer = this.buffers.get(type);
      if (!buffer) return;

      const windowAgg = this.calculateAggregation(buffer);
      typeAggregations.set(window, windowAgg);
      
      // Clear buffer for the longest window only
      if (window === '1d') {
        this.buffers.set(type, []);
      }
    });
  }

  private calculateAggregation(metrics: Metric[]): MetricAggregation {
    if (metrics.length === 0) {
      return {
        current: 0,
        min: 0,
        max: 0,
        avg: 0,
        count: 0,
        lastUpdate: new Date()
      };
    }

    const values = metrics.map(m => m.value);
    return {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
      lastUpdate: new Date()
    };
  }

  subscribe(
    metricType: MetricType,
    callback: (data: MetricAggregation) => void
  ): () => void {
    const subscribers = this.subscribers.get(metricType) || new Set();
    subscribers.add(callback);
    this.subscribers.set(metricType, subscribers);

    return () => {
      const subs = this.subscribers.get(metricType);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  private notifySubscribers(type: MetricType): void {
    const subscribers = this.subscribers.get(type);
    const aggregations = this.aggregations.get(type);
    
    if (!subscribers || !aggregations) return;

    const latestAgg = Array.from(aggregations.values())[0];
    subscribers.forEach(callback => {
      try {
        callback(latestAgg);
      } catch (error) {
        ErrorLogger.error('Error in metrics subscriber callback', error as Error);
      }
    });
  }

  getAggregation(
    metricType: MetricType,
    window: AggregationWindow
  ): MetricAggregation | null {
    return this.aggregations.get(metricType)?.get(window) || null;
  }

  cleanup(): void {
    this.flushIntervals.forEach(interval => clearInterval(interval));
    this.aggregations.clear();
    this.subscribers.clear();
    this.buffers.clear();
  }
}

export const metricsAggregatorService = MetricsAggregatorService.getInstance(); 