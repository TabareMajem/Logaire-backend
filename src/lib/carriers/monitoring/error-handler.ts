import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

export class CarrierErrorHandler {
  private readonly supabase = supabase;;

  async handleError(error: Error, context: {
    carrier: string;
    operation: string;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      // Log the error
      ErrorLogger.error(`Carrier error: ${context.carrier}`, error, context);

      // Store error in database
      await this.storeError({
        carrier: context.carrier,
        operation: context.operation,
        error_message: error.message,
        error_stack: error.stack,
        details: context.details,
        timestamp: new Date().toISOString()
      });

      // Check error threshold
      await this.checkErrorThreshold(context.carrier);
    } catch (handlingError) {
      ErrorLogger.error('Failed to handle carrier error', handlingError as Error);
    }
  }

  private async storeError(errorData: {
    carrier: string;
    operation: string;
    error_message: string;
    error_stack?: string;
    details?: Record<string, any>;
    timestamp: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('carrier_errors')
      .insert(errorData);

    if (error) throw error;
  }

  private async checkErrorThreshold(carrier: string): Promise<void> {
    // Get recent errors for this carrier
    const { data: errors, error } = await this.supabase
      .from('carrier_errors')
      .select('*')
      .eq('carrier', carrier)
      .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

    if (error) throw error;

    // If more than 5 errors in 15 minutes, mark carrier as degraded
    if (errors.length >= 5) {
      await this.markCarrierDegraded(carrier);
    }
  }

  private async markCarrierDegraded(carrier: string): Promise<void> {
    const { error } = await this.supabase
      .from('carrier_configurations')
      .update({ 
        status: 'degraded',
        last_error: new Date().toISOString()
      })
      .eq('code', carrier);

    if (error) throw error;
  }
}