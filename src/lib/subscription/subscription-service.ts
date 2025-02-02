import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class SubscriptionService {
  private supabase = supabase;;

  async checkSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    plan?: string;
    expiresAt?: Date;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('status, plan_id, current_period_end')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        isActive: data?.status === 'active',
        plan: data?.plan_id,
        expiresAt: data?.current_period_end ? new Date(data.current_period_end) : undefined
      };
    } catch (error) {
      ErrorLogger.error('Failed to check subscription status', error as Error);
      return { isActive: false };
    }
  }

  async validateAccess(userId: string, requiredPlan?: string): Promise<boolean> {
    try {
      const status = await this.checkSubscriptionStatus(userId);
      
      if (!status.isActive) return false;
      if (requiredPlan && status.plan !== requiredPlan) return false;
      
      return true;
    } catch (error) {
      ErrorLogger.error('Failed to validate access', error as Error);
      return false;
    }
  }
}