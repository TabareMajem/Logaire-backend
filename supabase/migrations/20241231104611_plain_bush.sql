/*
  # Integration System Migration

  1. Tables
    - carrier_integrations: Carrier API integrations
    - port_integrations: Port API integrations
    - integration_metrics: Integration performance metrics
    - integration_alerts: Integration monitoring alerts

  2. Security
    - RLS enabled on all tables
    - Read-only policies for authenticated users
*/

-- Create carrier integrations table
CREATE TABLE IF NOT EXISTS public.carrier_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carrier_configurations(id),
  api_type text NOT NULL,
  credentials jsonb NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create port integrations table
CREATE TABLE IF NOT EXISTS public.port_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES ports(id),
  api_type text NOT NULL,
  credentials jsonb NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create integration metrics table
CREATE TABLE IF NOT EXISTS public.integration_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('carrier', 'port')),
  operation text NOT NULL,
  duration integer NOT NULL,
  success boolean NOT NULL,
  error_message text,
  details jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- Create integration alerts table
CREATE TABLE IF NOT EXISTS public.integration_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('carrier', 'port')),
  type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  message text NOT NULL,
  details jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carrier_integrations_carrier_id ON carrier_integrations(carrier_id);
CREATE INDEX IF NOT EXISTS idx_port_integrations_port_id ON port_integrations(port_id);
CREATE INDEX IF NOT EXISTS idx_integration_metrics_integration_id ON integration_metrics(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_alerts_integration_id ON integration_alerts(integration_id);

-- Enable RLS
ALTER TABLE carrier_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE port_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_alerts ENABLE ROW LEVEL SECURITY;

-- Create metrics calculation function
CREATE OR REPLACE FUNCTION get_integration_metrics(
  integration_id_param uuid,
  integration_type_param text,
  lookback_minutes integer DEFAULT 60
)
RETURNS TABLE (
  request_count bigint,
  error_count bigint,
  average_latency numeric,
  success_rate numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as request_count,
    COUNT(*) FILTER (WHERE NOT success) as error_count,
    AVG(duration)::numeric as average_latency,
    (COUNT(*) FILTER (WHERE success)::numeric / COUNT(*)::numeric) as success_rate
  FROM integration_metrics
  WHERE
    integration_id = integration_id_param
    AND integration_type = integration_type_param
    AND recorded_at >= NOW() - (lookback_minutes || ' minutes')::interval;
END;
$$;

-- Create RLS policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Authenticated users can read carrier integrations" ON carrier_integrations;
    DROP POLICY IF EXISTS "Authenticated users can read port integrations" ON port_integrations;
    DROP POLICY IF EXISTS "Authenticated users can read integration metrics" ON integration_metrics;
    DROP POLICY IF EXISTS "Authenticated users can read integration alerts" ON integration_alerts;

    -- Create new policies
    CREATE POLICY "Authenticated users can read carrier integrations"
      ON carrier_integrations FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can read port integrations"
      ON port_integrations FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can read integration metrics"
      ON integration_metrics FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can read integration alerts"
      ON integration_alerts FOR SELECT
      TO authenticated
      USING (true);
END
$$;