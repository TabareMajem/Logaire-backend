import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'user']),
  companyId: z.string().uuid('Invalid company ID').optional()
});

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  interval: z.enum(['monthly', 'yearly']),
  features: z.array(z.string()),
  limits: z.record(z.number()).optional()
});

export const createContentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  type: z.enum(['email_template', 'document_template', 'help_article', 'announcement']),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  status: z.enum(['draft', 'published', 'archived']),
  metadata: z.record(z.unknown()).optional()
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type CreatePlanData = z.infer<typeof createPlanSchema>;
export type CreateContentData = z.infer<typeof createContentSchema>;