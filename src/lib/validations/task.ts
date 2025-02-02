import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date(),
  assigned_to: z.string().uuid('Invalid user ID'),
  related_to: z.object({
    type: z.enum(['shipment', 'booking', 'document']),
    id: z.string().uuid('Invalid reference ID')
  }).optional(),
  checklist: z.array(z.string()).default([])
});

export type TaskFormData = z.infer<typeof taskSchema>;