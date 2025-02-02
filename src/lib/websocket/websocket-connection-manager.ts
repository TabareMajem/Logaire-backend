import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';
import { wsReconnectionManager } from './websocket-reconnection-manager';

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  pongTimeout?: number;
}

export class WebSocketConnectionManager extends EventEmitter {
  private static instance: WebSocketConnectionManager;
  private connections: Map<string, WebSocket> = new Map();
  private pingIntervals: Map<string, NodeJS.Timer> = new Map();
  private pongTimeouts: Map<string, NodeJS.Timer> = new Map();

  private constructor() {
    super();
  }

  static getInstance(): WebSocketConnectionManager {
    if (!this.instance) {
      this.instance = new WebSocketConnectionManager();
    }
    return this.instance;
  }

  async createConnection(
    connectionId: string,
    config: WebSocketConfig
  ): Promise<WebSocket> {
    if (this.connections.has(connectionId)) {
      throw new Error(`Connection ${connectionId} already exists`);
    }

    try {
      const ws = new WebSocket(config.url, config.protocols);
      this.setupWebSocketHandlers(connectionId, ws, config);
      this.connections.set(connectionId, ws);

      await this.waitForConnection(ws);
      
      if (config.pingInterval) {
        this.setupHeartbeat(connectionId, ws, config);
      }

      return ws;
    } catch (error) {
      ErrorLogger.error(`Failed to create WebSocket connection ${connectionId}:`, error as Error);
      throw error;
    }
  }

  private setupWebSocketHandlers(
    connectionId: string,
    ws: WebSocket,
    config: WebSocketConfig
  ): void {
    ws.onclose = () => {
      this.handleDisconnection(connectionId, config);
    };

    ws.onerror = (error) => {
      ErrorLogger.error(`WebSocket ${connectionId} error:`, error);
      this.emit('error', { connectionId, error });
    };

    ws.onmessage = (event) => {
      if (event.data === 'pong') {
        this.handlePong(connectionId);
      } else {
        this.emit('message', { connectionId, data: event.data });
      }
    };
  }

  private handleDisconnection(connectionId: string, config: WebSocketConfig): void {
    this.clearHeartbeat(connectionId);
    this.connections.delete(connectionId);
    this.emit('disconnected', { connectionId });

    if (config.autoReconnect) {
      wsReconnectionManager.scheduleReconnection(
        connectionId,
        async () => {
          await this.createConnection(connectionId, config);
        },
        {
          maxAttempts: config.maxReconnectAttempts
        }
      );
    }
  }

  private setupHeartbeat(
    connectionId: string,
    ws: WebSocket,
    config: WebSocketConfig
  ): void {
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
        this.setPongTimeout(connectionId, config.pongTimeout || 10000);
      }
    }, config.pingInterval);

    this.pingIntervals.set(connectionId, pingInterval);
  }

  private setPongTimeout(connectionId: string, timeout: number): void {
    const existingTimeout = this.pongTimeouts.get(connectionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const pongTimeout = setTimeout(() => {
      const ws = this.connections.get(connectionId);
      if (ws) {
        ws.close();
        ErrorLogger.error(`WebSocket ${connectionId} pong timeout`);
      }
    }, timeout);

    this.pongTimeouts.set(connectionId, pongTimeout);
  }

  private handlePong(connectionId: string): void {
    const timeout = this.pongTimeouts.get(connectionId);
    if (timeout) {
      clearTimeout(timeout);
      this.pongTimeouts.delete(connectionId);
    }
  }

  private clearHeartbeat(connectionId: string): void {
    const pingInterval = this.pingIntervals.get(connectionId);
    if (pingInterval) {
      clearInterval(pingInterval);
      this.pingIntervals.delete(connectionId);
    }

    const pongTimeout = this.pongTimeouts.get(connectionId);
    if (pongTimeout) {
      clearTimeout(pongTimeout);
      this.pongTimeouts.delete(connectionId);
    }
  }

  private waitForConnection(ws: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };
    });
  }

  closeConnection(connectionId: string): void {
    const ws = this.connections.get(connectionId);
    if (ws) {
      this.clearHeartbeat(connectionId);
      ws.close();
      this.connections.delete(connectionId);
    }
  }

  closeAll(): void {
    for (const connectionId of this.connections.keys()) {
      this.closeConnection(connectionId);
    }
  }

  getConnection(connectionId: string): WebSocket | undefined {
    return this.connections.get(connectionId);
  }

  isConnected(connectionId: string): boolean {
    const ws = this.connections.get(connectionId);
    return ws?.readyState === WebSocket.OPEN;
  }
}

export const wsConnectionManager = WebSocketConnectionManager.getInstance(); 