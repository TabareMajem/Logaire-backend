/*
  # Ports Schema Update

  1. New Tables
    - `ports` - Port information and details
    - `terminals` - Terminal information within ports
    - `vessel_movements` - Vessel arrival and departure tracking
    - `port_congestion` - Port congestion level monitoring
    - `terminal_appointments` - Terminal appointment scheduling
    - `port_metrics` - Port operation metrics
    - `port_alerts` - Port-related alerts and notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access

  3. Changes
    - Add indexes for performance optimization
    - Add functions for metrics calculation
*/

-- Create ports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  country text NOT NULL,
  coordinates point,
  timezone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create terminals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.terminals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  code text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  working_hours jsonb NOT NULL,
  restrictions jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(port_id, code)
);

-- Create vessel_movements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vessel_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  terminal_id uuid REFERENCES public.terminals(id),
  vessel_id text NOT NULL,
  vessel_name text NOT NULL,
  movement_type text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  actual_time timestamptz,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create port_congestion table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.port_congestion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  level numeric(3,2) NOT NULL,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create terminal_appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.terminal_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id uuid REFERENCES public.terminals(id),
  type text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  container_number text,
  booking_number text,
  trucking_company text NOT NULL,
  driver text,
  vehicle text,
  status text NOT NULL,
  reference text,
  instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create port_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.port_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  operation text NOT NULL,
  duration integer NOT NULL,
  success boolean NOT NULL,
  error_message text,
  recorded_at timestamptz DEFAULT now()
);

-- Create port_alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.port_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  details jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vessel_movements_port_id ON vessel_movements(port_id);
CREATE INDEX IF NOT EXISTS idx_vessel_movements_terminal_id ON vessel_movements(terminal_id);
CREATE INDEX IF NOT EXISTS idx_port_congestion_port_id ON port_congestion(port_id);
CREATE INDEX IF NOT EXISTS idx_terminal_appointments_terminal_id ON terminal_appointments(terminal_id);
CREATE INDEX IF NOT EXISTS idx_port_metrics_port_id ON port_metrics(port_id);
CREATE INDEX IF NOT EXISTS idx_port_alerts_port_id ON port_alerts(port_id);

-- Enable RLS
ALTER TABLE ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE port_congestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE port_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE port_alerts ENABLE ROW LEVEL SECURITY;

-- Create function for port metrics
CREATE OR REPLACE FUNCTION get_port_metrics(
  p_port_id uuid,
  p_lookback_minutes integer
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
  FROM port_metrics
  WHERE
    port_id = p_port_id
    AND recorded_at >= NOW() - (p_lookback_minutes || ' minutes')::interval;
END;
$$;

-- Create RLS policies using DO block to handle existing policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public read access to ports" ON ports;
    DROP POLICY IF EXISTS "Public read access to terminals" ON terminals;
    DROP POLICY IF EXISTS "Public read access to vessel movements" ON vessel_movements;
    DROP POLICY IF EXISTS "Public read access to port congestion" ON port_congestion;
    DROP POLICY IF EXISTS "Users can manage their appointments" ON terminal_appointments;
    
    -- Create new policies
    CREATE POLICY "Public read access to ports"
      ON ports FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Public read access to terminals"
      ON terminals FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Public read access to vessel movements"
      ON vessel_movements FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Public read access to port congestion"
      ON port_congestion FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Users can manage their appointments"
      ON terminal_appointments FOR ALL
      TO authenticated
      USING (true);
END
$$;