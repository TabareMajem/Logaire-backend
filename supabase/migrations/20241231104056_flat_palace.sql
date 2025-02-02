/*
  # Admin System Setup

  1. New Tables
    - admin_audit_logs: Tracks admin actions
    - admin_settings: Stores system configuration
    - admin_notifications: Manages admin alerts
    - admin_metrics: Stores system metrics

  2. Security
    - Enables RLS on all tables
    - Creates admin-specific access policies
    - Adds appropriate indexes

  3. Functions
    - Adds admin metrics calculation function
*/

-- Create admin audit logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create admin metrics table
CREATE TABLE IF NOT EXISTS public.admin_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  value numeric NOT NULL,
  metadata jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_metrics_recorded_at ON admin_metrics(recorded_at);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;

-- Create admin metrics function
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS TABLE (
  total_users bigint,
  active_subscriptions bigint,
  total_companies bigint,
  system_health numeric,
  user_growth numeric,
  subscription_growth numeric,
  company_growth numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT
      (SELECT COUNT(*) FROM auth.users) as total_users,
      (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subs,
      (SELECT COUNT(*) FROM companies) as total_companies,
      (SELECT COALESCE(AVG(value), 100) FROM admin_metrics WHERE metric_type = 'system_health') as health,
      -- Calculate growth rates
      (SELECT COALESCE(
        ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'))::numeric /
        NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'), 0) - 1) * 100,
        0
      ) FROM auth.users) as user_growth,
      (SELECT COALESCE(
        ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'))::numeric /
        NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'), 0) - 1) * 100,
        0
      ) FROM subscriptions WHERE status = 'active') as sub_growth,
      (SELECT COALESCE(
        ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'))::numeric /
        NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'), 0) - 1) * 100,
        0
      ) FROM companies) as company_growth
  )
  SELECT
    total_users,
    active_subs,
    total_companies,
    health,
    user_growth,
    sub_growth,
    company_growth
  FROM metrics;
END;
$$;

-- Create RLS policies
DO $$ 
BEGIN
    -- Admin audit logs policies
    CREATE POLICY "Admins can read all audit logs"
      ON admin_audit_logs FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.uid() = id AND role = 'admin'
        )
      );

    -- Admin settings policies
    CREATE POLICY "Admins can manage settings"
      ON admin_settings FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.uid() = id AND role = 'admin'
        )
      );

    -- Admin notifications policies
    CREATE POLICY "Admins can read notifications"
      ON admin_notifications FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.uid() = id AND role = 'admin'
        )
      );

    -- Admin metrics policies
    CREATE POLICY "Admins can read metrics"
      ON admin_metrics FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.uid() = id AND role = 'admin'
        )
      );
END
$$;