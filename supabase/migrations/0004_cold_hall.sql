/*
  # Carrier Integration Schema

  1. New Tables
    - `carrier_configurations` - Carrier API credentials and settings
    - `carrier_metrics` - Performance metrics tracking
    - `carrier_health` - Health status monitoring
    - `carrier_alerts` - System alerts and notifications
    - `rate_cache` - Rate quote caching

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access

  3. Changes
    - Add indexes for performance optimization
    - Add functions for metrics calculation
*/

-- Create carrier configurations table
CREATE TABLE IF NOT EXISTS public.carrier_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('direct', 'aggregator')),
  credentials jsonb NOT NULL,
  endpoints jsonb NOT NULL,
  features jsonb NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create carrier metrics table
CREATE TABLE IF NOT EXISTS public.carrier_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carrier_configurations(id),
  operation text NOT NULL,
  duration integer NOT NULL,
  success boolean NOT NULL,
  error_message text,
  recorded_at timestamptz DEFAULT now()
);

-- Create carrier health table
CREATE TABLE IF NOT EXISTS public.carrier_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carrier_configurations(id),
  status text NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  latency integer,
  error text,
  checked_at timestamptz DEFAULT now()
);

-- Create carrier alerts table
CREATE TABLE IF NOT EXISTS public.carrier_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carrier_configurations(id),
  type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  message text NOT NULL,
  details jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create rate cache table
CREATE TABLE IF NOT EXISTS public.rate_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  rates jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carrier_metrics_carrier_id ON carrier_metrics(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_health_carrier_id ON carrier_health(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_alerts_carrier_id ON carrier_alerts(carrier_id);
CREATE INDEX IF NOT EXISTS idx_rate_cache_created_at ON rate_cache(created_at);

-- Enable RLS
ALTER TABLE carrier_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cache ENABLE ROW LEVEL SECURITY;

-- Create metrics calculation function
CREATE OR REPLACE FUNCTION get_carrier_metrics(
  carrier_id_param uuid,
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
  FROM carrier_metrics
  WHERE
    carrier_id = carrier_id_param
    AND recorded_at >= NOW() - (lookback_minutes || ' minutes')::interval;
END;
$$;

-- Create RLS policies
DO $$ 
BEGIN
    -- Create policies for carrier configurations
    CREATE POLICY "Authenticated users can read carrier configurations"
      ON carrier_configurations FOR SELECT
      TO authenticated
      USING (true);

    -- Create policies for carrier metrics
    CREATE POLICY "Authenticated users can read carrier metrics"
      ON carrier_metrics FOR SELECT
      TO authenticated
      USING (true);

    -- Create policies for carrier health
    CREATE POLICY "Authenticated users can read carrier health"
      ON carrier_health FOR SELECT
      TO authenticated
      USING (true);

    -- Create policies for carrier alerts
    CREATE POLICY "Authenticated users can read carrier alerts"
      ON carrier_alerts FOR SELECT
      TO authenticated
      USING (true);

    -- Create policies for rate cache
    CREATE POLICY "Authenticated users can read rate cache"
      ON rate_cache FOR SELECT
      TO authenticated
      USING (true);
END
$$;