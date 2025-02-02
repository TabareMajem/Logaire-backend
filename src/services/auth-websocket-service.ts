import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { websocketService } from './websocket-service';

class AuthWebSocketService {
  private static instance: AuthWebSocketService;
  private authToken: string | null = null;
  private refreshTimer: NodeJS.Timer | null = null;
  private readonly TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.setupAuthListeners();
  }

  static getInstance(): AuthWebSocketService {
    if (!this.instance) {
      this.instance = new AuthWebSocketService();
    }
    return this.instance;
  }

  private setupAuthListeners(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.authenticate(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        this.cleanup();
      }
    });
  }

  async authenticate(token: string): Promise<void> {
    try {
      this.authToken = token;
      await websocketService.connect({
        auth: { token },
        path: '/api/monitoring/socket'
      });

      this.startTokenRefresh();
    } catch (error) {
      ErrorLogger.error('WebSocket authentication failed', error as Error);
      throw error;
    }
  }

  private startTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session?.data.session) {
          await this.authenticate(session.data.session.access_token);
        }
      } catch (error) {
        ErrorLogger.error('Token refresh failed', error as Error);
      }
    }, this.TOKEN_REFRESH_INTERVAL);
  }

  private cleanup(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.authToken = null;
    websocketService.disconnect();
  }

  isAuthenticated(): boolean {
    return !!this.authToken && websocketService.isConnected();
  }
}

export const authWebSocketService = AuthWebSocketService.getInstance(); 