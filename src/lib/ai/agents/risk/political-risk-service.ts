import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { RiskFactor, RiskSeverity } from '../../types/risk';
import { ErrorLogger } from '@/lib/errors/logger';

interface PoliticalRiskData {
  countryCode: string;
  politicalStability: number;
  regulatoryQuality: number;
  tradeRestrictions: string[];
  sanctions: string[];
  lastUpdated: Date;
}

export class PoliticalRiskService {
  private supabase = supabase;

  async analyzeRoute(route: Route): Promise<RiskFactor[]> {
    try {
      const risks: RiskFactor[] = [];
      const countries = await this.getCountriesOnRoute(route);

      for (const country of countries) {
        const riskData = await this.getCountryRisks(country);
        risks.push(...this.analyzePoliticalRisks(riskData));
      }

      return this.prioritizeRisks(risks);
    } catch (error) {
      ErrorLogger.error('Political risk analysis failed', error as Error);
      throw error;
    }
  }

  private async getCountriesOnRoute(route: Route): Promise<string[]> {
    const { data, error } = await this.supabase
      .rpc('get_countries_on_route', {
        origin_coords: route.origin.coordinates,
        destination_coords: route.destination.coordinates,
        via_points: route.via.map(point => point.coordinates)
      });

    if (error) throw error;
    return data;
  }

  private async getCountryRisks(countryCode: string): Promise<PoliticalRiskData> {
    const { data, error } = await this.supabase
      .from('political_risks')
      .select('*')
      .eq('country_code', countryCode)
      .single();

    if (error) throw error;
    return data;
  }

  private analyzePoliticalRisks(data: PoliticalRiskData): RiskFactor[] {
    const risks: RiskFactor[] = [];

    // Analyze political stability
    if (data.politicalStability < 0.5) {
      risks.push({
        category: 'political',
        severity: this.determineSeverity(data.politicalStability),
        likelihood: 1 - data.politicalStability,
        impact: 'Political instability may affect operations',
        mitigation: [
          'Monitor political situation',
          'Prepare contingency routes',
          'Review insurance coverage'
        ]
      });
    }

    // Check trade restrictions
    if (data.tradeRestrictions.length > 0) {
      risks.push({
        category: 'political',
        severity: 'high',
        likelihood: 0.9,
        impact: 'Trade restrictions may affect shipment',
        mitigation: [
          'Review compliance requirements',
          'Obtain necessary permits',
          'Consider alternative routes'
        ]
      });
    }

    return risks;
  }

  private determineSeverity(stabilityScore: number): RiskSeverity {
    if (stabilityScore < 0.2) return 'critical';
    if (stabilityScore < 0.4) return 'high';
    if (stabilityScore < 0.6) return 'medium';
    return 'low';
  }

  private prioritizeRisks(risks: RiskFactor[]): RiskFactor[] {
    return risks.sort((a, b) => {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityScore[b.severity] - severityScore[a.severity];
    });
  }
}