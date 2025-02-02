import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';

interface ReconnectionConfig {
  initialDelay: number;
  maxDelay: number;
  maxAttempts: number;
  jitter: boolean;
}

interface ConnectionState {
  attempts: number;
  lastAttempt: number;
  nextDelay: number;
  timer: NodeJS.Timeout | null;
}

export class WebSocketReconnectionManager extends EventEmitter {
  private static instance: WebSocketReconnectionManager;
  private connections: Map<string, ConnectionState> = new Map();
  private readonly defaultConfig: ReconnectionConfig = {
    initialDelay: 1000,
    maxDelay: 30000,
    maxAttempts: 10,
    jitter: true
  };

  private constructor() {
    super();
  }

  static getInstance(): WebSocketReconnectionManager {
    if (!this.instance) {
      this.instance = new WebSocketReconnectionManager();
    }
    return this.instance;
  }

  scheduleReconnection(
    connectionId: string,
    onReconnect: () => Promise<void>,
    config?: Partial<ReconnectionConfig>
  ): void {
    const fullConfig = { ...this.defaultConfig, ...config };
    const state = this.getConnectionState(connectionId);

    if (state.attempts >= fullConfig.maxAttempts) {
      this.emit('maxAttemptsReached', { connectionId });
      return;
    }

    // Calculate next delay with exponential backoff
    const delay = this.calculateDelay(state, fullConfig);
    state.nextDelay = delay;

    // Clear any existing timer
    if (state.timer) {
      clearTimeout(state.timer);
    }

    // Schedule reconnection
    state.timer = setTimeout(async () => {
      try {
        state.attempts++;
        state.lastAttempt = Date.now();
        
        await onReconnect();
        
        this.emit('reconnected', { connectionId, attempts: state.attempts });
        this.resetConnectionState(connectionId);
      } catch (error) {
        ErrorLogger.error('WebSocket reconnection failed:', error as Error);
        this.emit('reconnectionFailed', { connectionId, error, attempts: state.attempts });
        this.scheduleReconnection(connectionId, onReconnect, fullConfig);
      }
    }, delay);
  }

  private getConnectionState(connectionId: string): ConnectionState {
    if (!this.connections.has(connectionId)) {
      this.connections.set(connectionId, {
        attempts: 0,
        lastAttempt: 0,
        nextDelay: this.defaultConfig.initialDelay,
        timer: null
      });
    }
    return this.connections.get(connectionId)!;
  }

  private calculateDelay(state: ConnectionState, config: ReconnectionConfig): number {
    const baseDelay = Math.min(
      config.initialDelay * Math.pow(2, state.attempts),
      config.maxDelay
    );

    if (!config.jitter) {
      return baseDelay;
    }

    // Add jitter to prevent thundering herd problem
    const jitterMax = Math.min(baseDelay * 0.25, 1000); // Max 1 second jitter
    const jitter = Math.random() * jitterMax;
    return baseDelay + jitter;
  }

  cancelReconnection(connectionId: string): void {
    const state = this.connections.get(connectionId);
    if (state?.timer) {
      clearTimeout(state.timer);
    }
    this.connections.delete(connectionId);
  }

  private resetConnectionState(connectionId: string): void {
    this.connections.set(connectionId, {
      attempts: 0,
      lastAttempt: 0,
      nextDelay: this.defaultConfig.initialDelay,
      timer: null
    });
  }

  getConnectionState(connectionId: string): Readonly<ConnectionState> | undefined {
    return this.connections.get(connectionId);
  }

  onMaxAttemptsReached(callback: (data: { connectionId: string }) => void): () => void {
    this.on('maxAttemptsReached', callback);
    return () => this.off('maxAttemptsReached', callback);
  }

  onReconnected(
    callback: (data: { connectionId: string; attempts: number }) => void
  ): () => void {
    this.on('reconnected', callback);
    return () => this.off('reconnected', callback);
  }

  onReconnectionFailed(
    callback: (data: { connectionId: string; error: Error; attempts: number }) => void
  ): () => void {
    this.on('reconnectionFailed', callback);
    return () => this.off('reconnectionFailed', callback);
  }

  cleanup(): void {
    this.connections.forEach((state, connectionId) => {
      if (state.timer) {
        clearTimeout(state.timer);
      }
    });
    this.connections.clear();
    this.removeAllListeners();
  }
}

export const wsReconnectionManager = WebSocketReconnectionManager.getInstance(); 