import { ErrorLogger } from '@/lib/errors/logger';
import { wsAuthHandler } from '@/lib/websocket/websocket-auth-handler';
import { wsRetryManager } from '@/lib/websocket/websocket-retry-manager';
import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  path: string;
  auth?: Record<string, any>;
}

export class WebSocketService extends EventEmitter {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private config: WebSocketConfig | null = null;
  private isConnecting = false;
  private connectionId: string = '';

  private constructor() {
    super();
    this.setupAuthHandler();
  }

  static getInstance(): WebSocketService {
    if (!this.instance) {
      this.instance = new WebSocketService();
    }
    return this.instance;
  }

  private setupAuthHandler(): void {
    wsAuthHandler.onAuthStateChange((token) => {
      if (token) {
        this.updateAuth({ token });
      } else {
        this.disconnect();
      }
    });

    wsAuthHandler.onRefreshFailed((error) => {
      ErrorLogger.error('WebSocket auth refresh failed', error);
      this.emit('authError', error);
    });
  }

  private async updateAuth(auth: Record<string, any>): Promise<void> {
    if (this.socket && this.socket.connected) {
      this.socket.auth = auth;
      await this.reconnect();
    }
  }

  async connect(config: WebSocketConfig): Promise<void> {
    if (this.isConnecting || (this.socket?.connected && this.config === config)) {
      return;
    }

    try {
      this.isConnecting = true;
      this.config = config;
      this.connectionId = `ws-${Date.now()}`;

      const token = await wsAuthHandler.getValidToken();
      if (!token) {
        throw new Error('No valid auth token available');
      }

      this.socket = io('/', {
        path: config.path,
        auth: { ...config.auth, token },
        reconnection: false // We'll handle reconnection ourselves
      });

      this.setupSocketListeners();
    } catch (error) {
      this.handleConnectionError(error as Error);
    } finally {
      this.isConnecting = false;
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.emit('connected');
      wsRetryManager.cancelRetry(this.connectionId);
    });

    this.socket.on('disconnect', (reason) => {
      this.emit('disconnected', reason);
      if (reason === 'io server disconnect') {
        this.handleDisconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.handleConnectionError(error);
    });

    this.socket.on('error', (error) => {
      ErrorLogger.error('WebSocket error', error);
      this.emit('error', error);
    });
  }

  private handleConnectionError(error: Error): void {
    ErrorLogger.error('WebSocket connection error', error);
    this.emit('connect_error', error);

    wsRetryManager.scheduleRetry(
      this.connectionId,
      async () => {
        await this.reconnect();
      }
    );
  }

  private async reconnect(): Promise<void> {
    this.disconnect();
    if (this.config) {
      await this.connect(this.config);
    }
  }

  private handleDisconnect(): void {
    wsRetryManager.scheduleRetry(
      this.connectionId,
      async () => {
        await this.reconnect();
      }
    );
  }

  subscribe<T>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      throw new Error('WebSocket not initialized');
    }

    const wrappedCallback = (data: T) => {
      try {
        callback(data);
      } catch (error) {
        ErrorLogger.error(`Error in subscription callback for event ${event}`, error as Error);
      }
    };

    this.socket.on(event, wrappedCallback);
    return () => this.socket?.off(event, wrappedCallback);
  }

  publish<T>(event: string, data: T): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit(event, data);
  }

  disconnect(): void {
    wsRetryManager.cancelRetry(this.connectionId);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = WebSocketService.getInstance(); 