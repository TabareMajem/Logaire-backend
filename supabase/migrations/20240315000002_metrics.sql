-- Create metrics tables
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type metric_type NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  agent_id UUID REFERENCES monitoring_agents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create metrics aggregation table
CREATE TABLE metrics_aggregation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type metric_type NOT NULL,
  window_size TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  min_value DOUBLE PRECISION NOT NULL,
  max_value DOUBLE PRECISION NOT NULL,
  avg_value DOUBLE PRECISION NOT NULL,
  count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create metrics configuration table
CREATE TABLE metrics_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type metric_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  collection_interval INTEGER NOT NULL DEFAULT 60000,
  retention_days INTEGER NOT NULL DEFAULT 30,
  aggregation_windows TEXT[] NOT NULL DEFAULT ARRAY['5m', '1h', '1d'],
  thresholds JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_metrics_type_timestamp ON metrics(type, timestamp);
CREATE INDEX idx_metrics_agent ON metrics(agent_id);
CREATE INDEX idx_metrics_aggregation_type_window ON metrics_aggregation(metric_type, window_size, start_time);

-- Create trigger for metrics config
CREATE TRIGGER update_metrics_config_updated_at
    BEFORE UPDATE ON metrics_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 