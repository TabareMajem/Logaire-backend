import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface VoiceFeedback {
  interactionId: string;
  rating: number;
  feedbackType: 'quality' | 'accuracy' | 'latency';
  comments?: string;
}

export class FeedbackCollector {
  private supabase = supabase;;

  async recordFeedback(feedback: VoiceFeedback): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('voice_feedback')
        .insert({
          interaction_id: feedback.interactionId,
          rating: feedback.rating,
          feedback_type: feedback.feedbackType,
          comments: feedback.comments,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record voice feedback', error as Error);
      throw error;
    }
  }

  async getFeedbackStats(): Promise<{
    averageRating: number;
    feedbackCount: number;
    qualityScore: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_voice_feedback_stats');

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get feedback stats', error as Error);
      throw error;
    }
  }
}