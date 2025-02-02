import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class DemoService {
  private static readonly DEMO_CREDENTIALS = {
    email: 'demo@freightflow.com',
    password: 'demo123456'
  };

  private static supabase = supabase;;

  static async login(): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword(
        this.DEMO_CREDENTIALS
      );
      
      if (error) throw error;

      if (data.user) {
        await this.supabase.auth.updateUser({
          data: { 
            is_demo: true,
            demo_started_at: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      ErrorLogger.error('Demo login failed', error as Error);
      throw error;
    }
  }

  static isDemoUser(user: any): boolean {
    return user?.user_metadata?.is_demo === true;
  }
}