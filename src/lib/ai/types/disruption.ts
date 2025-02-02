import { z } from 'zod';
import { Location } from './routing';

export type DisruptionType = 
  | 'weather' 
  | 'port_congestion'
  | 'carrier_delay'
  | 'customs_delay'
  | 'technical_issue'
  | 'force_majeure';

export interface Disruption {
  id: string;
  type: DisruptionType;
  location: Location;
  startTime: Date;
  estimatedEndTime?: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedServices: string[];
  metadata?: Record<string, any>;
}

export interface DisruptionUpdate {
  shipmentId: string;
  changes: Array<{
    type: string;
    before: any;
    after: any;
    impact: string;
  }>;
  timestamp: Date;
}

export const disruptionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'weather',
    'port_congestion',
    'carrier_delay',
    'customs_delay',
    'technical_issue',
    'force_majeure'
  ]),
  location: z.object({
    name: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
    type: z.string()
  }),
  startTime: z.date(),
  estimatedEndTime: z.date().optional(),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  affectedServices: z.array(z.string()),
  metadata: z.record(z.any()).optional()
});