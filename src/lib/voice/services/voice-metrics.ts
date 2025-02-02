import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface VoiceMetric {
  interactionId: string;
  duration: number;
  success: boolean;
  confidence: number;
  errorType?: string;
}

export class VoiceMetricsCollector {
  private supabase = supabase;;

  async recordMetric(metric: VoiceMetric): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('voice_metrics')
        .insert({
          interaction_id: metric.interactionId,
          duration: metric.duration,
          success: metric.success,
          confidence: metric.confidence,
          error_type: metric.errorType,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record voice metric', error as Error);
    }
  }

  async getMetrics(timeframe: number = 24 * 60): Promise<{
    totalInteractions: number;
    successRate: number;
    averageDuration: number;
    averageConfidence: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_voice_metrics', {
          lookback_minutes: timeframe
        });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get voice metrics', error as Error);
      throw error;
    }
  }
}