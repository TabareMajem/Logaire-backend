import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface ConversationContext {
  lastCommand?: string;
  parameters?: Record<string, any>;
  timestamp: Date;
}

export class ContextManager {
  private readonly supabase = supabase;;
  private context: ConversationContext | null = null;

  async saveContext(context: Partial<ConversationContext>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_context')
        .insert({
          ...context,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      this.context = { ...context, timestamp: new Date() } as ConversationContext;
    } catch (error) {
      ErrorLogger.error('Failed to save context', error as Error);
    }
  }

  async getContext(): Promise<ConversationContext | null> {
    try {
      if (this.context) return this.context;

      const { data, error } = await this.supabase
        .from('conversation_context')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get context', error as Error);
      return null;
    }
  }

  async clearContext(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_context')
        .delete()
        .gte('timestamp', new Date(Date.now() - 30 * 60 * 1000).toISOString());

      if (error) throw error;
      this.context = null;
    } catch (error) {
      ErrorLogger.error('Failed to clear context', error as Error);
    }
  }
}