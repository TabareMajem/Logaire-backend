import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class AnalyticsCommandHandlers {
  private supabase = supabase;;

  async getShipmentMetrics(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_shipment_metrics');

      if (error) throw error;

      return `You have ${data.active_count} active shipments with an on-time delivery rate of ${(data.on_time_rate * 100).toFixed(1)}%`;
    } catch (error) {
      ErrorLogger.error('Get shipment metrics command failed', error as Error);
      return "I couldn't retrieve your shipment metrics.";
    }
  }

  async getPerformanceReport(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_performance_metrics');

      if (error) throw error;

      return `Your overall performance metrics show ${data.completed_count} completed shipments this month with ${data.delay_count} delays reported.`;
    } catch (error) {
      ErrorLogger.error('Get performance report command failed', error as Error);
      return "I couldn't generate your performance report.";
    }
  }
}