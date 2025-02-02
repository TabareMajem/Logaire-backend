-- Create monitoring configuration tables
CREATE TABLE monitoring_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_interval INTEGER NOT NULL DEFAULT 60000,
  retention_days INTEGER NOT NULL DEFAULT 30,
  enabled_metrics metric_type[] NOT NULL DEFAULT ARRAY['cpu', 'memory']::metric_type[],
  alert_notifications JSONB NOT NULL DEFAULT '{"email": true, "slack": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE monitoring_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status health_status NOT NULL DEFAULT 'healthy',
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create error logging table
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  error_name TEXT,
  error_message TEXT,
  error_stack TEXT,
  context JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create triggers
CREATE TRIGGER update_monitoring_config_updated_at
    BEFORE UPDATE ON monitoring_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_agents_updated_at
    BEFORE UPDATE ON monitoring_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 