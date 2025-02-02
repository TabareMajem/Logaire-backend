-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE metric_type AS ENUM ('cpu', 'memory', 'disk', 'network');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');
CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy');

-- Create metrics table
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type metric_type NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity alert_severity NOT NULL,
  status alert_status NOT NULL DEFAULT 'active',
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_id UUID REFERENCES metrics(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create health checks table
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component TEXT NOT NULL,
  status health_status NOT NULL,
  latency DOUBLE PRECISION,
  error_rate DOUBLE PRECISION,
  last_check TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_metrics_type_timestamp ON metrics(type, timestamp);
CREATE INDEX idx_alerts_status_severity ON alerts(status, severity);
CREATE INDEX idx_health_checks_component ON health_checks(component);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 