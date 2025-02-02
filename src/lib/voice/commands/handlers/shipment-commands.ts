import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class ShipmentCommandHandlers {
  private supabase = supabase;;

  async trackShipment(params: { reference: string }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('shipments')
        .select('status, current_location')
        .eq('reference_number', params.reference)
        .single();

      if (error) throw error;

      return `Shipment ${params.reference} is currently ${data.status} at ${data.current_location}`;
    } catch (error) {
      ErrorLogger.error('Track shipment command failed', error as Error);
      return `I couldn't find information for shipment ${params.reference}`;
    }
  }

  async listActiveShipments(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('shipments')
        .select('reference_number, status')
        .in('status', ['booked', 'in_transit'])
        .limit(5);

      if (error) throw error;

      if (!data.length) {
        return "You don't have any active shipments.";
      }

      const shipments = data.map(s => 
        `${s.reference_number} is ${s.status}`
      ).join(', ');

      return `Your active shipments are: ${shipments}`;
    } catch (error) {
      ErrorLogger.error('List shipments command failed', error as Error);
      return "I couldn't retrieve your active shipments.";
    }
  }
}