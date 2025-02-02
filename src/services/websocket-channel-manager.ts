import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';
import { websocketService } from './websocket-service';

interface ChannelSubscription<T> {
  channelId: string;
  callback: (data: T) => void;
  errorHandler?: (error: Error) => void;
}

class WebSocketChannelManager extends EventEmitter {
  private static instance: WebSocketChannelManager;
  private subscriptions: Map<string, Set<ChannelSubscription<any>>>;
  private retryTimeouts: Map<string, NodeJS.Timeout>;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly INITIAL_RETRY_DELAY = 1000;

  private constructor() {
    super();
    this.subscriptions = new Map();
    this.retryTimeouts = new Map();
    this.setupWebSocket();
  }

  static getInstance(): WebSocketChannelManager {
    if (!this.instance) {
      this.instance = new WebSocketChannelManager();
    }
    return this.instance;
  }

  private setupWebSocket(): void {
    websocketService.on('connect', () => {
      this.handleReconnect();
    });

    websocketService.on('disconnect', () => {
      this.handleDisconnect();
    });
  }

  subscribe<T>(
    channelId: string,
    callback: (data: T) => void,
    errorHandler?: (error: Error) => void
  ): () => void {
    const subscription: ChannelSubscription<T> = {
      channelId,
      callback,
      errorHandler
    };

    if (!this.subscriptions.has(channelId)) {
      this.subscriptions.set(channelId, new Set());
      this.setupChannel(channelId);
    }

    this.subscriptions.get(channelId)!.add(subscription);

    return () => {
      this.unsubscribe(channelId, subscription);
    };
  }

  private async setupChannel(channelId: string, retryAttempt = 0): Promise<void> {
    try {
      await websocketService.subscribe(channelId, (data) => {
        this.handleChannelMessage(channelId, data);
      });

      // Clear any existing retry timeout
      if (this.retryTimeouts.has(channelId)) {
        clearTimeout(this.retryTimeouts.get(channelId));
        this.retryTimeouts.delete(channelId);
      }
    } catch (error) {
      this.handleChannelError(channelId, error as Error, retryAttempt);
    }
  }

  private handleChannelMessage(channelId: string, data: any): void {
    const subscribers = this.subscriptions.get(channelId);
    if (!subscribers) return;

    subscribers.forEach(sub => {
      try {
        sub.callback(data);
      } catch (error) {
        ErrorLogger.error(`Error in channel ${channelId} subscriber callback`, error as Error);
        sub.errorHandler?.(error as Error);
      }
    });
  }

  private handleChannelError(channelId: string, error: Error, retryAttempt: number): void {
    ErrorLogger.error(`Channel ${channelId} error`, error);

    if (retryAttempt < this.MAX_RETRY_ATTEMPTS) {
      const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt);
      const timeout = setTimeout(() => {
        this.setupChannel(channelId, retryAttempt + 1);
      }, delay);

      this.retryTimeouts.set(channelId, timeout);
    } else {
      this.emit('channelError', { channelId, error });
      this.notifySubscribersOfError(channelId, error);
    }
  }

  private notifySubscribersOfError(channelId: string, error: Error): void {
    const subscribers = this.subscriptions.get(channelId);
    if (!subscribers) return;

    subscribers.forEach(sub => {
      sub.errorHandler?.(error);
    });
  }

  private unsubscribe<T>(channelId: string, subscription: ChannelSubscription<T>): void {
    const subscribers = this.subscriptions.get(channelId);
    if (!subscribers) return;

    subscribers.delete(subscription);

    if (subscribers.size === 0) {
      this.subscriptions.delete(channelId);
      websocketService.unsubscribe(channelId);
      
      if (this.retryTimeouts.has(channelId)) {
        clearTimeout(this.retryTimeouts.get(channelId));
        this.retryTimeouts.delete(channelId);
      }
    }
  }

  private async handleReconnect(): Promise<void> {
    // Resubscribe to all channels
    for (const channelId of this.subscriptions.keys()) {
      await this.setupChannel(channelId);
    }
  }

  private handleDisconnect(): void {
    // Clear all retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }

  cleanup(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    this.subscriptions.clear();
    this.removeAllListeners();
  }
}

export const channelManager = WebSocketChannelManager.getInstance(); 