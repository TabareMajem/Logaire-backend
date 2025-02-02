import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { ErrorLogger } from '@/lib/errors/logger';
import { Location } from '../..';

interface DelayStatistics {
  averageDelay: number;
  standardDeviation: number;
  percentile90: number;
  commonCauses: string[];
}

export class BufferCalculator {
  private supabase = supabase;

  async getHistoricalDelays(route: Route): Promise<Record<string, DelayStatistics>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_historical_delays', {
          origin_port: route.origin.name,
          destination_port: route.destination.name,
          lookback_days: 90
        });

      if (error) throw error;

      return this.processDelayData(data);
    } catch (error) {
      ErrorLogger.error('Failed to fetch historical delays', error as Error);
      throw error;
    }
  }

  async calculateOptimalBuffer(
    location: Location,
    transitTime: number
  ): Promise<number> {
    try {
      const delays = await this.getLocationDelays(location);
      return this.computeBuffer(delays, transitTime);
    } catch (error) {
      ErrorLogger.error('Failed to calculate optimal buffer', error as Error);
      throw error;
    }
  }

  private async getLocationDelays(location: Location): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('location_delays')
      .select('delay_minutes')
      .eq('location_code', location.name)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(d => d.delay_minutes);
  }

  private computeBuffer(delays: number[], transitTime: number): number {
    const mean = this.calculateMean(delays);
    const stdDev = this.calculateStdDev(delays, mean);
    
    // Base buffer on statistical analysis
    const baseBuffer = mean + (2 * stdDev); // 95% confidence interval
    
    // Adjust based on transit time
    const transitFactor = Math.log10(transitTime) / 2;
    
    return Math.ceil(baseBuffer * transitFactor);
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStdDev(values: number[], mean: number): number {
    const variance = values.reduce((sum, val) => {
      const diff = val - mean;
      return sum + (diff * diff);
    }, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private processDelayData(data: any[]): Record<string, DelayStatistics> {
    const delays = data.reduce((acc, record) => {
      const key = `${record.origin}-${record.destination}`;
      if (!acc[key]) {
        acc[key] = {
          delays: [],
          causes: {}
        };
      }
      acc[key].delays.push(record.delay_hours);
      record.delay_causes.forEach((cause: string) => {
        acc[key].causes[cause] = (acc[key].causes[cause] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(delays).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: this.calculateStatistics(value)
    }), {});
  }

  private calculateStatistics(data: any): DelayStatistics {
    const delays = data.delays.sort((a: number, b: number) => a - b);
    const mean = this.calculateMean(delays);
    const stdDev = this.calculateStdDev(delays, mean);

    const commonCauses = Object.entries(data.causes)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([cause]: any) => cause);

    return {
      averageDelay: mean,
      standardDeviation: stdDev,
      percentile90: delays[Math.floor(delays.length * 0.9)],
      commonCauses
    };
  }
}