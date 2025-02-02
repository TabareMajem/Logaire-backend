import { supabase } from '@/lib/supabase/client';
import { Location } from '../../types/routing';
import { ErrorLogger } from '@/lib/errors/logger';

interface RouteHistory {
  averageTransitTime: number;
  reliability: number;
  commonIssues: string[];
  successRate: number;
}

export class RouteHistoryService {
  private supabase = supabase;

  async getRouteHistory(
    origin: Location,
    destination: Location
  ): Promise<RouteHistory> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_route_history', {
          origin_name: origin.name,
          destination_name: destination.name
        });

      if (error) throw error;
      return this.processHistoricalData(data);
    } catch (error) {
      ErrorLogger.error('Failed to fetch route history', error as Error);
      throw error;
    }
  }

  private processHistoricalData(data: any[]): RouteHistory {
    const completedShipments = data.filter(s => s.status === 'delivered');
    const totalShipments = data.length;

    return {
      averageTransitTime: this.calculateAverageTransitTime(completedShipments),
      reliability: this.calculateReliability(completedShipments),
      commonIssues: this.identifyCommonIssues(data),
      successRate: (completedShipments.length / totalShipments) * 100
    };
  }

  private calculateAverageTransitTime(shipments: any[]): number {
    if (shipments.length === 0) return 0;
    const totalTime = shipments.reduce((sum, s) => 
      sum + (new Date(s.delivery_date).getTime() - new Date(s.pickup_date).getTime()),
      0
    );
    return totalTime / shipments.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private calculateReliability(shipments: any[]): number {
    if (shipments.length === 0) return 0;
    const onTimeDeliveries = shipments.filter(s => 
      new Date(s.delivery_date) <= new Date(s.estimated_delivery)
    );
    return (onTimeDeliveries.length / shipments.length) * 100;
  }

  // private identifyCommonIssues(shipments: any[]): string[] {
  //   const issues = shipments
  //     .flatMap(s => s.issues || [])
  //     .reduce((acc, issue) => ({
  //       ...acc,
  //       [issue]: (acc[issue] || 0) + 1
  //     }), {} as Record<string, number>);

  //   return Object.entries(issues)
  //     .sort(([, a], [, b]) =>  b - a)
  //     .slice(0, 3)
  //     .map(([issue]) => issue);
  // }

  private identifyCommonIssues(shipments: any[]): string[] {
    // Create a record of issues with counts
    const issues = shipments
      .flatMap(s => s.issues || []) // Flatten issues from all shipments
      .reduce<Record<string, number>>((acc, issue) => {
        acc[issue] = (acc[issue] || 0) + 1; // Increment the issue count
        return acc;
      }, {}); // Ensuring the type of accumulator is Record<string, number>
  
    // Sort the issues based on their frequency (from highest to lowest)
    return Object.entries(issues)
      .sort(([issueA, countA], [issueB, countB]) => countB - countA) // Now a and b are numbers
      .slice(0, 3) // Get top 3 issues
      .map(([issue]) => issue); // Extract only the issue names
  }
}