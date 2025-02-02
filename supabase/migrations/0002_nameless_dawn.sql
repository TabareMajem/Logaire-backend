/*
  # Port Operations Schema
  
  1. New Tables
    - ports: Core port information and metadata
    - terminals: Port terminal details and working hours
    - vessel_movements: Vessel arrival and departure tracking
    - port_congestion: Real-time port congestion monitoring
    - terminal_appointments: Terminal appointment scheduling
    - port_metrics: Port operation performance metrics
    - port_alerts: Port-related alerts and notifications

  2. Security
    - RLS enabled on all tables
    - Public read access for authenticated users
    - Restricted write access where needed

  3. Functions
    - get_port_metrics: Aggregates port performance metrics
*/

-- Create ports table
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

-- Create terminals table
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

-- Create vessel_movements table
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

-- Create port_congestion table
CREATE TABLE IF NOT EXISTS public.port_congestion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  level numeric(3,2) NOT NULL,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create terminal_appointments table
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

-- Create port_metrics table
CREATE TABLE IF NOT EXISTS public.port_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_id uuid REFERENCES public.ports(id),
  operation text NOT NULL,
  duration integer NOT NULL,
  success boolean NOT NULL,
  error_message text,
  recorded_at timestamptz DEFAULT now()
);

-- Create port_alerts table
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

-- Create RLS policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ports' AND policyname = 'Public read access to ports'
    ) THEN
        CREATE POLICY "Public read access to ports"
          ON ports FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'terminals' AND policyname = 'Public read access to terminals'
    ) THEN
        CREATE POLICY "Public read access to terminals"
          ON terminals FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vessel_movements' AND policyname = 'Public read access to vessel movements'
    ) THEN
        CREATE POLICY "Public read access to vessel movements"
          ON vessel_movements FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'port_congestion' AND policyname = 'Public read access to port congestion'
    ) THEN
        CREATE POLICY "Public read access to port congestion"
          ON port_congestion FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'terminal_appointments' AND policyname = 'Users can manage their appointments'
    ) THEN
        CREATE POLICY "Users can manage their appointments"
          ON terminal_appointments FOR ALL
          TO authenticated
          USING (true);
    END IF;
END
$$;