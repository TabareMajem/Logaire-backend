import { supabase } from '@/lib/supabase/client';
import { CongestionUpdate } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class CongestionAnalyzer {
  private readonly supabase = supabase;;

  async analyzeCongestion(portId: string): Promise<{
    currentLevel: number;
    forecast: Array<{
      timestamp: Date;
      level: number;
    }>;
    recommendations: string[];
  }> {
    try {
      // Get historical congestion data
      const history = await this.getHistoricalData(portId);
      
      // Calculate current congestion level
      const currentLevel = this.calculateCurrentLevel(history);
      
      // Generate forecast
      const forecast = await this.generateForecast(history);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(currentLevel, forecast);

      return {
        currentLevel,
        forecast,
        recommendations
      };
    } catch (error) {
      ErrorLogger.error('Failed to analyze congestion', error as Error);
      throw error;
    }
  }

  private async getHistoricalData(portId: string): Promise<CongestionUpdate[]> {
    const { data, error } = await this.supabase
      .from('port_congestion')
      .select('*')
      .eq('port_id', portId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  }

  private calculateCurrentLevel(history: CongestionUpdate[]): number {
    if (!history.length) return 0;
    
    // Use exponential moving average for smoothing
    const alpha = 0.3;
    let level = history[0].level;
    
    for (let i = 1; i < Math.min(5, history.length); i++) {
      level = alpha * history[i].level + (1 - alpha) * level;
    }
    
    return level;
  }

  private async generateForecast(
    history: CongestionUpdate[]
  ): Promise<Array<{ timestamp: Date; level: number }>> {
    // Simple linear regression for forecasting
    const forecast: Array<{ timestamp: Date; level: number }> = [];
    const hours = 24;

    for (let i = 1; i <= hours; i++) {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() + i);

      const level = this.predictCongestionLevel(history, timestamp);
      forecast.push({ timestamp, level });
    }

    return forecast;
  }

  private predictCongestionLevel(history: CongestionUpdate[], timestamp: Date): number {
    // Implementation of prediction logic
    return 0.5; // Placeholder
  }

  private generateRecommendations(
    currentLevel: number,
    forecast: Array<{ timestamp: Date; level: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (currentLevel > 0.8) {
      recommendations.push('Consider rescheduling non-urgent operations');
      recommendations.push('Expect significant delays at terminal gates');
    } else if (currentLevel > 0.6) {
      recommendations.push('Plan for potential delays during peak hours');
    }

    const peakCongestion = Math.max(...forecast.map(f => f.level));
    if (peakCongestion > currentLevel + 0.2) {
      recommendations.push('High congestion expected in the next 24 hours');
    }

    return recommendations;
  }
}