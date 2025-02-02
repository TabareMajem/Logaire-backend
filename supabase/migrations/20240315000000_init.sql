-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE metric_type AS ENUM (
  'cpu',
  'memory',
  'disk',
  'network'
);

CREATE TYPE alert_severity AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE alert_status AS ENUM (
  'active',
  'acknowledged',
  'resolved'
);

CREATE TYPE health_status AS ENUM (
  'healthy',
  'degraded',
  'unhealthy'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'; 