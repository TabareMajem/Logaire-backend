-- Create monitoring configuration table
CREATE TABLE monitoring_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metrics_config JSONB NOT NULL DEFAULT '{
    "collectionInterval": 30000,
    "retentionDays": 30,
    "enableAggregation": true
  }',
  alerts_config JSONB NOT NULL DEFAULT '{
    "enableEmailNotifications": false,
    "enableSlackNotifications": false,
    "thresholds": {
      "cpu": { "warning": 70, "critical": 90 },
      "memory": { "warning": 80, "critical": 95 },
      "disk": { "warning": 85, "critical": 95 },
      "network": { "warning": 100, "critical": 200 }
    }
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create monitoring config history table for auditing
CREATE TABLE monitoring_config_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES monitoring_config(id),
  changed_by UUID NOT NULL,
  previous_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for monitoring config history
CREATE INDEX idx_monitoring_config_history_config_id 
  ON monitoring_config_history(config_id);

-- Create trigger to track config changes
CREATE OR REPLACE FUNCTION track_monitoring_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO monitoring_config_history (
      config_id,
      changed_by,
      previous_value,
      new_value
    ) VALUES (
      OLD.id,
      current_setting('app.current_user_id')::UUID,
      jsonb_build_object(
        'metrics_config', OLD.metrics_config,
        'alerts_config', OLD.alerts_config
      ),
      jsonb_build_object(
        'metrics_config', NEW.metrics_config,
        'alerts_config', NEW.alerts_config
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER monitoring_config_audit
  AFTER UPDATE ON monitoring_config
  FOR EACH ROW
  EXECUTE FUNCTION track_monitoring_config_changes();

-- Insert default configuration
INSERT INTO monitoring_config DEFAULT VALUES; 