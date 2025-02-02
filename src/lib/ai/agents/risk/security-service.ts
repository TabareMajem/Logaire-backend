import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { RiskFactor } from '../../types/risk';
import { ErrorLogger } from '@/lib/errors/logger';

export interface Location {
  name: string;
  coordinates: [number, number];
  type: "port" | "warehouse" | "terminal" | "other";
  code?: string;
}

export interface SecurityData {
  crimeRate: number;
}

export class SecurityService {
  private supabase = supabase;

  async assessThreats(route: Route): Promise<RiskFactor[]> {
    try {
      const risks: RiskFactor[] = [];
      const locations = [route.origin, ...route.via, route.destination];

      for (const location of locations) {
        const securityData = await this.fetchSecurityData(location);
        const locationRisks = this.analyzeSecurityRisks(securityData, location);
        risks.push(...locationRisks);
      }

      return this.prioritizeRisks(risks);
    } catch (error) {
      ErrorLogger.error('Security assessment failed', error as Error);
      throw error;
    }
  }

  private async fetchSecurityData(location: Location): Promise<SecurityData> {
    const { data, error } = await this.supabase
      .from('security_data')
      .select('*')
      .eq('location_code', location.name)
      .single();

    if (error) throw error;
    return data;
  }

  private analyzeSecurityRisks(
    data: SecurityData,
    location: Location
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];

    if (data.crimeRate > 0.7) {
      risks.push({
        category: 'security',
        severity: 'high',
        likelihood: data.crimeRate,
        impact: 'High crime rate may affect cargo security',
        mitigation: [
          'Use secure parking facilities',
          'Implement additional security measures',
          'Consider route alternatives'
        ],
        location: location as import('../../types/routing').Location,
        // location,
      });
    }

    return risks;
  }

  private prioritizeRisks(risks: RiskFactor[]): RiskFactor[] {
    return risks.sort((a, b) => {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityScore[b.severity] - severityScore[a.severity];
    });
  }
}