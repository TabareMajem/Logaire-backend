import { ErrorLogger } from '@/lib/errors/logger';
import { io, Socket } from 'socket.io-client';

export class MonitoringSocket {
  private static instance: MonitoringSocket;
  private socket: Socket | null = null;
  private subscribers: Set<(data: any) => void> = new Set();

  private constructor() {
    this.initializeSocket();
  }

  static getInstance(): MonitoringSocket {
    if (!this.instance) {
      this.instance = new MonitoringSocket();
    }
    return this.instance;
  }

  private initializeSocket(): void {
    try {
      this.socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
        path: '/monitoring',
        auth: {
          token: process.env.NEXT_PUBLIC_WS_TOKEN
        }
      });

      this.socket.on('metrics-update', (data) => {
        this.notifySubscribers(data);
      });

      this.socket.on('connect_error', (error) => {
        ErrorLogger.error('Monitoring socket connection error', error);
      });

    } catch (error) {
      ErrorLogger.error('Failed to initialize monitoring socket', error as Error);
    }
  }

  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => callback(data));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
} 