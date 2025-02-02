// src/lib/ai/types/scheduling.ts -->

import { z } from 'zod';
import { Location } from './routing';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ScheduleConstraints {
  earliestPickup?: Date;
  latestDelivery?: Date;
  requiredStops?: Location[];
  transitTimeLimit?: number;
  workingHours?: {
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };
  holidays?: Date[];
}

export interface TransitPoint {
  location: Location;
  estimatedTime: Date;
  bufferHours: number;
  constraints?: {
    workingHours?: string[];
    restrictions?: string[];
  };
}

export interface RecommendedSchedule {
  pickupWindow: DateRange;
  transitPoints: TransitPoint[];
  deliveryWindow: DateRange;
  tradeoffs: string[];
}

export interface ScheduleOptimization {
  constraints: string[];
  recommendedSchedule: {
    pickupWindow: {
      start: Date;
      end: Date;
    };
    transitPoints: TransitPoint[];
    deliveryWindow: {
      start: Date;
      end: Date;
    };
  };
  reliability: number;
  warnings?: string[]; // Added to support warnings
  metadata?: { // Added to support metadata
    lastUpdated: Date;
    generatedBy: string;
  };
}

export const scheduleOptimizationSchema = z.object({
  recommendedSchedule: z.object({
    pickupWindow: z.object({
      start: z.date(),
      end: z.date()
    }),
    transitPoints: z.array(z.object({
      location: z.object({
        name: z.string(),
        coordinates: z.tuple([z.number(), z.number()]),
        type: z.enum(["port", "warehouse", "terminal", "other"]), // Updated this
        code: z.string()
      }),
      estimatedTime: z.date(),
      bufferHours: z.number(),
      constraints: z.object({
        workingHours: z.array(z.string()).optional(),
        restrictions: z.array(z.string()).optional()
      }).optional()
    })),
    deliveryWindow: z.object({
      start: z.date(),
      end: z.date()
    })
  }),
  reliability: z.number(),
  constraints: z.array(z.string()),
  alternatives: z.array(z.object({
    pickupWindow: z.object({
      start: z.date(),
      end: z.date()
    }),
    transitPoints: z.array(z.object({
      location: z.object({
        name: z.string(),
        coordinates: z.tuple([z.number(), z.number()]),
        type: z.enum(["port", "warehouse", "terminal", "other"]), // Updated this
        code: z.string()
      }),
      estimatedTime: z.date(),
      bufferHours: z.number()
    })),
    deliveryWindow: z.object({
      start: z.date(),
      end: z.date()
    }),
    tradeoffs: z.array(z.string())
  }))
});