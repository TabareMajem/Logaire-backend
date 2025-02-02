import { EventEmitter } from 'events';
import { ErrorLogger } from '../errors/logger';
import { WebSocketAuthMiddleware } from './auth-middleware';
import { WebSocketClient } from './server';

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  reconnections: number;
}

export class WebSocketConnectionManager extends EventEmitter {
  private connections: Map<string, WebSocketClient> = new Map();
  private stats: ConnectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
    reconnections: 0
  };

  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly STATS_INTERVAL = 5000; // 5 seconds

  constructor() {
    super();
    this.startPeriodicCleanup();
    this.startStatsReporting();
  }

  async addConnection(client: WebSocketClient, token: string): Promise<boolean> {
    try {
      const authenticatedClient = await WebSocketAuthMiddleware.authenticate(
        client,
        { headers: { authorization: `Bearer ${token}` } } as any
      );

      if (!authenticatedClient) {
        return false;
      }

      this.connections.set(authenticatedClient.userId, authenticatedClient);
      this.stats.totalConnections++;
      this.stats.activeConnections++;
      this.setupConnectionHandlers(authenticatedClient);
      
      this.emit('connection', authenticatedClient);
      return true;
    } catch (error) {
      ErrorLogger.error('Error adding connection:', error as Error);
      return false;
    }
  }

  private setupConnectionHandlers(client: WebSocketClient): void {
    client.on('message', (data: string) => {
      try {
        this.stats.messagesReceived++;
        const message = JSON.parse(data);
        this.emit('message', client, message);
      } catch (error) {
        this.stats.errors++;
        ErrorLogger.error('Error handling message:', error as Error);
      }
    });

    client.on('close', () => {
      this.removeConnection(client);
    });

    client.on('error', (error: Error) => {
      this.stats.errors++;
      ErrorLogger.error('WebSocket error:', error);
    });
  }

  removeConnection(client: WebSocketClient): void {
    this.connections.delete((client as any).userId);
    this.stats.activeConnections--;
    this.emit('disconnection', client);
  }

  broadcast(message: any, filter?: (client: WebSocketClient) => boolean): void {
    const payload = JSON.stringify(message);
    
    this.connections.forEach(client => {
      if (client.readyState === WebSocket.OPEN && (!filter || filter(client))) {
        try {
          client.send(payload);
          this.stats.messagesSent++;
        } catch (error) {
          this.stats.errors++;
          ErrorLogger.error('Error broadcasting message:', error as Error);
        }
      }
    });
  }

  sendToUser(userId: string, message: any): boolean {
    const client = this.connections.get(userId);
    if (client?.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
        this.stats.messagesSent++;
        return true;
      } catch (error) {
        this.stats.errors++;
        ErrorLogger.error('Error sending message to user:', error as Error);
      }
    }
    return false;
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.connections.forEach((client, userId) => {
        if (client.readyState === WebSocket.CLOSED) {
          this.removeConnection(client);
        }
      });
    }, this.CLEANUP_INTERVAL);
  }

  private startStatsReporting(): void {
    setInterval(() => {
      this.emit('stats', { ...this.stats });
    }, this.STATS_INTERVAL);
  }

  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  getActiveConnections(): number {
    return this.stats.activeConnections;
  }

  cleanup(): void {
    this.connections.forEach(client => {
      try {
        client.close();
      } catch (error) {
        ErrorLogger.error('Error closing connection:', error as Error);
      }
    });
    this.connections.clear();
    this.stats.activeConnections = 0;
  }
}

export const connectionManager = new WebSocketConnectionManager(); 