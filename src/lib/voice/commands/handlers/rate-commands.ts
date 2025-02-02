import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class RateCommandHandlers {
  private supabase = supabase;;

  async getRateQuote(params: { 
    origin: string; 
    destination: string;
    containerType?: string;
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_rate_quote', {
          origin_code: params.origin,
          destination_code: params.destination,
          container_type: params.containerType || '40HC'
        });

      if (error) throw error;

      return `The current rate from ${params.origin} to ${params.destination} is ${data.currency} ${data.amount}`;
    } catch (error) {
      ErrorLogger.error('Rate quote command failed', error as Error);
      return "I couldn't get a rate quote for that route.";
    }
  }

  async getMarketTrends(params: { route?: string }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_market_trends', {
          route_param: params.route
        });

      if (error) throw error;

      return `Market rates are ${data.trend} with an average change of ${data.change_percentage}% over the last 30 days`;
    } catch (error) {
      ErrorLogger.error('Market trends command failed', error as Error);
      return "I couldn't retrieve the market trends.";
    }
  }
}