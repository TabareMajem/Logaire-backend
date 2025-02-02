import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class AuthService {
  private supabase = supabase;

  async signIn(email: string, password: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Sign in failed', error as Error);
      throw error;
    }
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Sign up failed', error as Error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Sign out failed', error as Error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      ErrorLogger.error('Get current user failed', error as Error);
      return null;
    }
  }

  async demoLogin(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signInWithPassword({
        email: 'demo@freightflow.com',
        password: 'demo123456'
      });

      if (error) throw error;

      await this.supabase.auth.updateUser({
        data: { 
          is_demo: true,
          demo_started_at: new Date().toISOString()
        }
      });
    } catch (error) {
      ErrorLogger.error('Demo login failed', error as Error);
      throw error;
    }
  }

  isDemoUser(user: any): boolean {
    return user?.user_metadata?.is_demo === true;
  }
}