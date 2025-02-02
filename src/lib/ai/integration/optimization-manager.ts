import { AIAgentService } from './agent-service';
import { ShipmentOptimization } from '../types/integration';
import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { AIAgentContext } from '../types';
import { ShipmentDetails } from '../types/optimization';

export class OptimizationManager {
  private agentService: AIAgentService;
  private supabase = supabase;

  constructor(context: AIAgentContext) {
    this.agentService = new AIAgentService(context);
  }

  async optimizeShipment(shipmentId: string): Promise<ShipmentOptimization> {
    try {
      // Fetch shipment details
      const shipment = await this.fetchShipmentDetails(shipmentId);
      
      // Run optimization
      const optimization = await this.agentService.optimizeShipment(shipment);
      
      // Save optimization results
      await this.saveOptimizationResults(shipmentId, optimization);
      
      // Create activity log
      await this.createActivityLog(shipmentId, optimization);

      return optimization;
    } catch (error) {
      ErrorLogger.error('Shipment optimization failed', error as Error);
      throw error;
    }
  }

  private async fetchShipmentDetails(shipmentId: string): Promise<ShipmentDetails> {
    const { data, error } = await this.supabase
      .from('shipments')
      .select(`
        *,
        origin:locations!origin_id(*),
        destination:locations!destination_id(*),
        constraints:shipment_constraints(*)
      `)
      .eq('id', shipmentId)
      .single();

    if (error) throw error;
    return data;
  }

  private async saveOptimizationResults(
    shipmentId: string,
    optimization: ShipmentOptimization
  ): Promise<void> {
    const { error } = await this.supabase
      .from('shipment_optimizations')
      .insert({
        shipment_id: shipmentId,
        optimization_results: optimization,
        confidence: optimization.summary.confidence,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async createActivityLog(
    shipmentId: string,
    optimization: ShipmentOptimization
  ): Promise<void> {
    const { error } = await this.supabase
      .from('activities')
      .insert({
        shipment_id: shipmentId,
        type: 'optimization',
        action: 'Shipment optimization completed',
        details: {
          confidence: optimization.summary.confidence,
          recommendations: optimization.summary.recommendations.length,
          warnings: optimization.summary.warnings.length
        }
      });

    if (error) throw error;
  }
}