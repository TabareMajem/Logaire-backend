import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';

interface WebSocketMessage {
  type: 'metrics' | 'alert' | 'status';
  payload: any;
}

export class MetricsWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 5000;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private readonly url: string) {
    super();
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
      this.startPingInterval();
    } catch (error) {
      ErrorLogger.error('WebSocket connection error:', error as Error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.subscribeToMetrics();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        ErrorLogger.error('WebSocket message parsing error:', error as Error);
      }
    };

    this.ws.onclose = () => {
      this.emit('disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      ErrorLogger.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'metrics':
        this.emit('metrics', message.payload);
        break;
      case 'alert':
        this.emit('alert', message.payload);
        break;
      case 'status':
        this.emit('status', message.payload);
        break;
      default:
        ErrorLogger.warn('Unknown message type:', message.type);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.RECONNECT_INTERVAL);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.sendMessage({ type: 'ping', payload: {} });
    }, 30000);
  }

  private subscribeToMetrics(): void {
    this.sendMessage({
      type: 'subscribe',
      payload: {
        metrics: ['system_health', 'api_latency', 'resource_usage']
      }
    });
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const metricsWebSocket = new MetricsWebSocket(
  process.env.NEXT_PUBLIC_METRICS_WS_URL || 'ws://localhost:3001/metrics'
); 