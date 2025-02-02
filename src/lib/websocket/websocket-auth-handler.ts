import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { EventEmitter } from 'events';

interface AuthState {
  token: string | null;
  expiresAt: Date | null;
}

export class WebSocketAuthHandler extends EventEmitter {
  private static instance: WebSocketAuthHandler;
  private authState: AuthState = { token: null, expiresAt: null };
  private refreshTimer: NodeJS.Timer | null = null;
  private readonly REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private retryAttempts = 0;

  private constructor() {
    super();
    this.setupAuthListeners();
  }

  static getInstance(): WebSocketAuthHandler {
    if (!this.instance) {
      this.instance = new WebSocketAuthHandler();
    }
    return this.instance;
  }

  private setupAuthListeners(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.handleNewSession(session);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      }
    });
  }

  private handleNewSession(session: any): void {
    this.authState = {
      token: session.access_token,
      expiresAt: new Date(session.expires_at * 1000)
    };
    this.scheduleTokenRefresh();
    this.emit('authenticated', this.authState.token);
  }

  private handleSignOut(): void {
    this.cleanup();
    this.emit('signedOut');
  }

  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.authState.expiresAt) return;

    const now = new Date();
    const refreshTime = new Date(this.authState.expiresAt.getTime() - this.REFRESH_BUFFER);
    
    if (refreshTime <= now) {
      this.refreshToken();
      return;
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime.getTime() - now.getTime());
  }

  private async refreshToken(isRetry = false): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      if (!session) throw new Error('No session after refresh');

      this.retryAttempts = 0;
      this.handleNewSession(session);
    } catch (error) {
      ErrorLogger.error('Failed to refresh WebSocket auth token', error as Error);
      
      if (this.retryAttempts < this.MAX_RETRY_ATTEMPTS) {
        this.retryAttempts++;
        const delay = Math.pow(2, this.retryAttempts - 1) * 1000;
        
        setTimeout(() => {
          this.refreshToken(true);
        }, delay);
      } else {
        this.emit('refreshFailed', error);
      }
    }
  }

  async getValidToken(): Promise<string | null> {
    if (!this.authState.token || !this.authState.expiresAt) {
      return null;
    }

    if (new Date() >= this.authState.expiresAt) {
      await this.refreshToken();
    }

    return this.authState.token;
  }

  private cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.authState = { token: null, expiresAt: null };
    this.retryAttempts = 0;
  }

  onAuthStateChange(callback: (token: string | null) => void): () => void {
    this.on('authenticated', callback);
    this.on('signedOut', () => callback(null));
    return () => {
      this.off('authenticated', callback);
      this.off('signedOut', () => callback(null));
    };
  }

  onRefreshFailed(callback: (error: Error) => void): () => void {
    this.on('refreshFailed', callback);
    return () => this.off('refreshFailed', callback);
  }
}

export const wsAuthHandler = WebSocketAuthHandler.getInstance(); 