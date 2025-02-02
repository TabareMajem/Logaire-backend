-- Create alert rules table
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type metric_type NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below', 'equals')),
  threshold DOUBLE PRECISION NOT NULL,
  severity alert_severity NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_alert_rules_metric_type ON alert_rules(metric_type, enabled);

-- Create trigger for updated_at
CREATE TRIGGER update_alert_rules_updated_at
    BEFORE UPDATE ON alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create alert rule evaluations table for historical tracking
CREATE TABLE alert_rule_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES alert_rules(id),
  triggered BOOLEAN NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_alert_rule_evaluations_rule ON alert_rule_evaluations(rule_id, evaluated_at); 