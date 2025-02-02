import { ErrorLogger } from '@/lib/errors/logger';
import { alertSystem } from '@/lib/monitoring/alerts/alert-system';
import { metricsCollector } from '@/lib/monitoring/metrics/metrics-collector';
import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  subscriptions: Set<string>;
  userId?: string;
}

export class WSServer {
  private wss: WebSocketServer;
  private readonly pingInterval = 30000;
  private readonly clients = new Map<WebSocket, WebSocketClient>();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
    this.setupMetricsSubscription();
    this.setupAlertSubscription();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const client = ws as WebSocketClient;
      client.isAlive = true;
      client.subscriptions = new Set();

      this.clients.set(ws, client);

      client.on('pong', () => {
        client.isAlive = true;
      });

      client.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(client, message);
        } catch (error) {
          ErrorLogger.error('Error handling WebSocket message:', error as Error);
        }
      });

      client.on('close', () => {
        this.clients.delete(ws);
      });

      client.on('error', (error) => {
        ErrorLogger.error('WebSocket client error:', error);
        this.clients.delete(ws);
      });
    });

    // Setup periodic ping to keep connections alive
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = ws as WebSocketClient;
        if (client.isAlive === false) {
          this.clients.delete(ws);
          return ws.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, this.pingInterval);
  }

  private setupMetricsSubscription(): void {
    metricsCollector.on('metric', (metric) => {
      this.broadcast('metrics', metric, (client) => 
        client.subscriptions.has(`metric:${metric.type}`)
      );
    });
  }

  private setupAlertSubscription(): void {
    alertSystem.on('alert', (alert) => {
      this.broadcast('alert', alert);
    });
  }

  private handleMessage(client: WebSocketClient, message: any): void {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(client, message.payload);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(client, message.payload);
        break;
      case 'auth':
        this.handleAuth(client, message.payload);
        break;
      default:
        ErrorLogger.warn('Unknown message type:', message.type);
    }
  }

  private handleSubscribe(client: WebSocketClient, payload: any): void {
    if (Array.isArray(payload.metrics)) {
      payload.metrics.forEach((metric: string) => {
        client.subscriptions.add(`metric:${metric}`);
      });
    }
  }

  private handleUnsubscribe(client: WebSocketClient, payload: any): void {
    if (Array.isArray(payload.metrics)) {
      payload.metrics.forEach((metric: string) => {
        client.subscriptions.delete(`metric:${metric}`);
      });
    }
  }

  private handleAuth(client: WebSocketClient, payload: any): void {
    if (payload.userId) {
      client.userId = payload.userId;
    }
  }

  broadcast(type: string, payload: any, filter?: (client: WebSocketClient) => boolean): void {
    const message = JSON.stringify({ type, payload });

    this.wss.clients.forEach((ws) => {
      const client = ws as WebSocketClient;
      if (
        ws.readyState === WebSocket.OPEN &&
        (!filter || filter(client))
      ) {
        ws.send(message);
      }
    });
  }

  sendToUser(userId: string, type: string, payload: any): void {
    const message = JSON.stringify({ type, payload });

    this.wss.clients.forEach((ws) => {
      const client = ws as WebSocketClient;
      if (
        ws.readyState === WebSocket.OPEN &&
        client.userId === userId
      ) {
        ws.send(message);
      }
    });
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  cleanup(): void {
    this.wss.close();
  }
} 