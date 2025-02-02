import { PostgrestError } from '@supabase/supabase-js';

export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface MetricRecord {
  id: string;
  type: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AlertRuleRecord {
  id: string;
  metric_type: string;
  condition: string;
  threshold: number;
  severity: string;
  enabled: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertRecord {
  id: string;
  rule_id: string;
  metric_type: string;
  severity: string;
  status: string;
  message: string;
  value: number;
  timestamp: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthCheckRecord {
  id: string;
  component: string;
  status: string;
  latency?: number;
  error_rate?: number;
  message?: string;
  last_check: string;
  created_at: string;
  updated_at: string;
} 