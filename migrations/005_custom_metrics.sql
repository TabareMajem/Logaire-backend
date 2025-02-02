-- Create custom metric definitions table
CREATE TABLE custom_metric_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  formula JSONB NOT NULL,
  base_metrics metric_type[] NOT NULL,
  unit TEXT NOT NULL,
  thresholds JSONB,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create custom metrics table for storing values
CREATE TABLE custom_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  definition_id UUID NOT NULL REFERENCES custom_metric_definitions(id),
  value DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_custom_metrics_definition_timestamp 
  ON custom_metrics(definition_id, timestamp);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_metric_definitions_updated_at
    BEFORE UPDATE ON custom_metric_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create user preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  monitoring_config JSONB NOT NULL DEFAULT '{
    "theme": "light",
    "refreshInterval": 30000,
    "defaultTimeRange": "1h",
    "defaultMetrics": ["cpu", "memory"],
    "notifications": {
      "email": true,
      "browser": true,
      "slack": false
    },
    "dashboardLayout": {
      "panels": []
    }
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for user preferences updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 