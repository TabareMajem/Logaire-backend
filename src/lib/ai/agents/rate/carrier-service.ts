import { supabase } from '@/lib/supabase/client';
import { CarrierPerformance } from '../../types/rate';
import { ErrorLogger } from '@/lib/errors/logger';

export class CarrierService {
  private supabase = supabase;

  async analyzePerformance(
    preferredCarriers?: string[]
  ): Promise<Record<string, CarrierPerformance>> {
    try {
      const query = this.supabase
        .from('carrier_performance')
        .select('*')
        .order('updated_at', { ascending: false });

      if (preferredCarriers?.length) {
        query.in('carrier_id', preferredCarriers);
      }

      const { data, error } = await query;
      if (error) throw error;

      return this.processPerformanceData(data);
    } catch (error) {
      ErrorLogger.error('Failed to analyze carrier performance', error as Error);
      throw error;
    }
  }

  private processPerformanceData(
    data: any[]
  ): Record<string, CarrierPerformance> {
    return data.reduce((acc, carrier) => ({
      ...acc,
      [carrier.id]: {
        reliability: this.calculateReliability(carrier),
        averageDelay: this.calculateAverageDelay(carrier),
        damageRate: carrier.damage_rate,
        customerRating: carrier.customer_rating
      }
    }), {});
  }

  private calculateReliability(carrier: any): number {
    const onTimeDeliveries = carrier.on_time_deliveries;
    const totalDeliveries = carrier.total_deliveries;
    return totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;
  }

  private calculateAverageDelay(carrier: any): number {
    return carrier.total_delay_hours / carrier.delayed_deliveries || 0;
  }
}