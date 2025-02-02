import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
}

interface RetryState {
  attempts: number;
  nextDelay: number;
}

export class WebSocketRetryManager extends EventEmitter {
  private static instance: WebSocketRetryManager;
  private retryStates: Map<string, RetryState>;
  private retryTimers: Map<string, NodeJS.Timeout>;
  private readonly defaultConfig: RetryConfig = {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    factor: 2
  };

  private constructor() {
    super();
    this.retryStates = new Map();
    this.retryTimers = new Map();
  }

  static getInstance(): WebSocketRetryManager {
    if (!this.instance) {
      this.instance = new WebSocketRetryManager();
    }
    return this.instance;
  }

  scheduleRetry(
    connectionId: string,
    operation: () => Promise<void>,
    config: Partial<RetryConfig> = {}
  ): void {
    const fullConfig = { ...this.defaultConfig, ...config };
    const state = this.getRetryState(connectionId);

    if (state.attempts >= fullConfig.maxAttempts) {
      this.emit('maxRetriesExceeded', { connectionId });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await operation();
        this.clearRetryState(connectionId);
        this.emit('retrySucceeded', { connectionId });
      } catch (error) {
        ErrorLogger.error(`Retry attempt ${state.attempts + 1} failed for ${connectionId}`, error as Error);
        state.attempts++;
        state.nextDelay = Math.min(
          state.nextDelay * fullConfig.factor,
          fullConfig.maxDelay
        );
        this.scheduleRetry(connectionId, operation, fullConfig);
      }
    }, state.nextDelay);

    this.retryTimers.set(connectionId, timer);
  }

  private getRetryState(connectionId: string): RetryState {
    if (!this.retryStates.has(connectionId)) {
      this.retryStates.set(connectionId, {
        attempts: 0,
        nextDelay: this.defaultConfig.initialDelay
      });
    }
    return this.retryStates.get(connectionId)!;
  }

  cancelRetry(connectionId: string): void {
    const timer = this.retryTimers.get(connectionId);
    if (timer) {
      clearTimeout(timer);
      this.retryTimers.delete(connectionId);
    }
    this.clearRetryState(connectionId);
  }

  private clearRetryState(connectionId: string): void {
    this.retryStates.delete(connectionId);
    this.retryTimers.delete(connectionId);
  }

  onMaxRetriesExceeded(callback: (data: { connectionId: string }) => void): () => void {
    this.on('maxRetriesExceeded', callback);
    return () => this.off('maxRetriesExceeded', callback);
  }

  onRetrySucceeded(callback: (data: { connectionId: string }) => void): () => void {
    this.on('retrySucceeded', callback);
    return () => this.off('retrySucceeded', callback);
  }

  cleanup(): void {
    this.retryTimers.forEach(timer => clearTimeout(timer));
    this.retryTimers.clear();
    this.retryStates.clear();
    this.removeAllListeners();
  }
}

export const wsRetryManager = WebSocketRetryManager.getInstance(); 