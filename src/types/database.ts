// src/types/database.ts

import { z } from "zod";

// Enums
export const SubscriptionStatus = z.enum(['trial', 'active', 'past_due', 'cancelled']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const UserRole = z.enum(['admin', 'user', 'viewer']);
export type UserRole = z.infer<typeof UserRole>;

// Base interfaces
export interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

// Schema definitions
export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  subscription_status: SubscriptionStatus,
  subscription_end_date: z.date().nullable(),
  settings: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.date(),
  updated_at: z.date(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: UserRole,
  email: z.string().email(),
  permissions: z.record(z.unknown()).default({}),
  preferences: z.record(z.unknown()).default({}),
  last_login_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  table_name: z.string(),
  record_id: z.string().uuid(),
  old_data: z.record(z.unknown()).nullable(),
  new_data: z.record(z.unknown()).nullable(),
  created_at: z.date(),
});

// Type exports
export type Company = z.infer<typeof companySchema>;
export type User = z.infer<typeof userSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;

// Helper types
export type CompanySettings = {
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  dateFormat?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
};

export type UserPermissions = {
  shipments?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  bookings?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  documents?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
};

export type UserPreferences = {
  theme?: 'light' | 'dark' | 'system';
  sidebar?: {
    expanded?: boolean;
    favorites?: string[];
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
};