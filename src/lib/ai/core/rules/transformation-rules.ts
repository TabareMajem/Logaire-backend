import { ProcessingRule } from '../types';

export function createTransformationRule(
  id: string,
  transformer: (data: any) => Promise<any>
): ProcessingRule {
  return {
    id,
    type: 'transformation',
    condition: () => true,
    action: transformer
  };
}

export const commonTransformationRules = {
  normalizeLocations: (): ProcessingRule =>
    createTransformationRule(
      'normalize-locations',
      async (data) => {
        if (data.origin) {
          data.origin = data.origin.toUpperCase();
        }
        if (data.destination) {
          data.destination = data.destination.toUpperCase();
        }
        return data;
      }
    ),

  calculateMetrics: (fields: string[]): ProcessingRule =>
    createTransformationRule(
      'calculate-metrics',
      async (data) => {
        const metrics: Record<string, number> = {};
        for (const field of fields) {
          if (typeof data[field] === 'number') {
            metrics[`${field}_squared`] = Math.pow(data[field], 2);
            metrics[`${field}_sqrt`] = Math.sqrt(Math.abs(data[field]));
          }
        }
        return { ...data, metrics };
      }
    )
};