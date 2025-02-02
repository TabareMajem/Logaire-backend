import { ErrorLogger } from '@/lib/errors/logger';
import { Metric, MetricType } from '@/types/monitoring';
import { metricsAggregatorService } from './metrics-aggregator-service';
import { websocketService } from './websocket-service';

interface MetricsSubscription {
  type: MetricType;
  callback: (metric: Metric) => void;
}

class RealTimeMetricsService {
  private static instance: RealTimeMetricsService;
  private subscriptions: Map<string, Set<MetricsSubscription>>;
  private retryAttempts: Map<string, number>;
  private readonly MAX_RETRY_ATTEMPTS = 3;

  private constructor() {
    this.subscriptions = new Map();
    this.retryAttempts = new Map();
    this.setupWebSocket();
  }

  static getInstance(): RealTimeMetricsService {
    if (!this.instance) {
      this.instance = new RealTimeMetricsService();
    }
    return this.instance;
  }

  private setupWebSocket(): void {
    websocketService.on('connect', () => {
      this.resubscribeAll();
    });

    websocketService.on('disconnect', () => {
      // Handle disconnect - metrics will be resubscribed on reconnect
    });
  }

  subscribe(type: MetricType, callback: (metric: Metric) => void): () => void {
    const channelId = `metrics:${type}`;
    
    if (!this.subscriptions.has(channelId)) {
      this.subscriptions.set(channelId, new Set());
      this.subscribeToChannel(channelId, type);
    }

    const subscription: MetricsSubscription = { type, callback };
    this.subscriptions.get(channelId)?.add(subscription);

    return () => {
      const subs = this.subscriptions.get(channelId);
      if (subs) {
        subs.delete(subscription);
        if (subs.size === 0) {
          this.unsubscribeFromChannel(channelId);
        }
      }
    };
  }

  private async subscribeToChannel(channelId: string, type: MetricType): Promise<void> {
    try {
      await websocketService.subscribe<Metric>(channelId, (metric) => {
        this.handleMetricUpdate(channelId, metric);
      });

      // Start aggregating metrics for this type
      metricsAggregatorService.startAggregating(type);

      // Reset retry attempts on successful subscription
      this.retryAttempts.delete(channelId);
    } catch (error) {
      this.handleSubscriptionError(channelId, type, error as Error);
    }
  }

  private handleMetricUpdate(channelId: string, metric: Metric): void {
    const subscribers = this.subscriptions.get(channelId);
    if (!subscribers) return;

    subscribers.forEach(({ callback }) => {
      try {
        callback(metric);
      } catch (error) {
        ErrorLogger.error('Error in metric subscriber callback', error as Error);
      }
    });
  }

  private async handleSubscriptionError(channelId: string, type: MetricType, error: Error): Promise<void> {
    ErrorLogger.error(`Failed to subscribe to ${channelId}`, error);

    const attempts = (this.retryAttempts.get(channelId) || 0) + 1;
    this.retryAttempts.set(channelId, attempts);

    if (attempts <= this.MAX_RETRY_ATTEMPTS) {
      const delay = Math.pow(2, attempts - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      await this.subscribeToChannel(channelId, type);
    } else {
      ErrorLogger.error(`Max retry attempts reached for ${channelId}`);
      this.retryAttempts.delete(channelId);
    }
  }

  private unsubscribeFromChannel(channelId: string): void {
    websocketService.unsubscribe(channelId);
    this.subscriptions.delete(channelId);
    this.retryAttempts.delete(channelId);
  }

  private async resubscribeAll(): Promise<void> {
    for (const [channelId, subscribers] of this.subscriptions.entries()) {
      const type = Array.from(subscribers)[0]?.type;
      if (type) {
        await this.subscribeToChannel(channelId, type);
      }
    }
  }

  cleanup(): void {
    this.subscriptions.clear();
    this.retryAttempts.clear();
  }
}

export const realTimeMetricsService = RealTimeMetricsService.getInstance(); 