import { z } from 'zod';
import { Route } from './routing';
import { ScheduleOptimization } from './scheduling';

export interface RecoveryPlan {
  alternativeRoute?: Route;
  scheduleAdjustment?: ScheduleOptimization;
  costImpact: {
    amount: number;
    currency: string;
    breakdown: Record<string, number>;
  };
  actions: Array<{
    type: 'reroute' | 'reschedule' | 'notify' | 'document';
    priority: 'immediate' | 'high' | 'medium' | 'low';
    description: string;
    deadline?: Date;
  }>;
  stakeholderUpdates: Array<{
    stakeholder: string;
    message: string;
    channel: 'email' | 'sms' | 'notification';
  }>;
}

export const recoveryPlanSchema = z.object({
  alternativeRoute: z.any().optional(), // Import from routing schema
  scheduleAdjustment: z.any().optional(), // Import from scheduling schema
  costImpact: z.object({
    amount: z.number(),
    currency: z.string(),
    breakdown: z.record(z.number())
  }),
  actions: z.array(z.object({
    type: z.enum(['reroute', 'reschedule', 'notify', 'document']),
    priority: z.enum(['immediate', 'high', 'medium', 'low']),
    description: z.string(),
    deadline: z.date().optional()
  })),
  stakeholderUpdates: z.array(z.object({
    stakeholder: z.string(),
    message: z.string(),
    channel: z.enum(['email', 'sms', 'notification'])
  }))
});