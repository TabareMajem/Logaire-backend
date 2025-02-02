// src/lib/auth/session-manager.ts -->

import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from './auth-store';
import { ErrorLogger } from '@/lib/errors/logger';

export class SessionManager {
  private static supabase = supabase;

  static async refreshSession(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        useAuthStore.getState().setUser(session.user);
      }
    } catch (error) {
      ErrorLogger.error('Session refresh failed', error as Error);
    }
  }

  static async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      useAuthStore.getState().signOut();
    } catch (error) {
      ErrorLogger.error('Logout failed', error as Error);
      throw error;
    }
  }

  static async getSessionUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      ErrorLogger.error('Get session user failed', error as Error);
      return null;
    }
  }
}