import { NextApiRequest } from 'next';
import { WebSocket } from 'ws';
import { verifyToken } from '../auth/token-service';
import { ErrorLogger } from '../errors/logger';
import { WebSocketClient } from './server';

interface AuthenticatedClient extends WebSocketClient {
  userId: string;
  roles: string[];
}

export class WebSocketAuthMiddleware {
  private static readonly AUTH_TIMEOUT = 5000; // 5 seconds to authenticate

  static async authenticate(
    ws: WebSocket,
    request: NextApiRequest
  ): Promise<AuthenticatedClient | null> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        ws.close(1008, 'Authentication timeout');
        resolve(null);
      }, this.AUTH_TIMEOUT);

      ws.once('message', async (data: string) => {
        clearTimeout(timeoutId);
        try {
          const message = JSON.parse(data);
          if (message.type !== 'auth') {
            ws.close(1008, 'Authentication required');
            resolve(null);
            return;
          }

          const token = message.payload?.token;
          if (!token) {
            ws.close(1008, 'Token required');
            resolve(null);
            return;
          }

          try {
            const decoded = await verifyToken(token);
            const client = ws as AuthenticatedClient;
            client.userId = decoded.userId;
            client.roles = decoded.roles;
            client.isAlive = true;
            client.subscriptions = new Set();

            resolve(client);
          } catch (error) {
            ErrorLogger.error('Token verification failed:', error as Error);
            ws.close(1008, 'Invalid token');
            resolve(null);
          }
        } catch (error) {
          ErrorLogger.error('Authentication message parsing failed:', error as Error);
          ws.close(1008, 'Invalid authentication message');
          resolve(null);
        }
      });
    });
  }

  static checkPermission(client: AuthenticatedClient, requiredRole: string): boolean {
    return client.roles.includes(requiredRole) || client.roles.includes('admin');
  }

  static middleware(handler: (client: AuthenticatedClient, message: any) => void) {
    return (client: WebSocketClient, message: any) => {
      const authClient = client as AuthenticatedClient;
      if (!authClient.userId) {
        client.close(1008, 'Authentication required');
        return;
      }

      if (message.requiresRole && !this.checkPermission(authClient, message.requiresRole)) {
        client.close(1008, 'Insufficient permissions');
        return;
      }

      handler(authClient, message);
    };
  }

  static subscriptionMiddleware(
    client: AuthenticatedClient,
    topic: string,
    requiredRole?: string
  ): boolean {
    if (requiredRole && !this.checkPermission(client, requiredRole)) {
      return false;
    }

    client.subscriptions.add(topic);
    return true;
  }
} 