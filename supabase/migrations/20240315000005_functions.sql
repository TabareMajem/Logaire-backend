-- Create function to aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_metrics(
  p_metric_type metric_type,
  p_window_size TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS TABLE (
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION,
  avg_value DOUBLE PRECISION,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    MIN(value) as min_value,
    MAX(value) as max_value,
    AVG(value) as avg_value,
    COUNT(*) as count
  FROM metrics
  WHERE type = p_metric_type
    AND timestamp >= p_start_time
    AND timestamp < p_end_time;
END;
$$ LANGUAGE plpgsql;

-- Create function to evaluate alert rules
CREATE OR REPLACE FUNCTION evaluate_alert_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_rule alert_rules%ROWTYPE;
  v_alert_id UUID;
BEGIN
  -- Check each enabled alert rule
  FOR v_rule IN 
    SELECT * FROM alert_rules 
    WHERE metric_type = NEW.type AND enabled = true
  LOOP
    -- Evaluate the condition
    IF (
      (v_rule.condition = 'above' AND NEW.value > v_rule.threshold) OR
      (v_rule.condition = 'below' AND NEW.value < v_rule.threshold) OR
      (v_rule.condition = 'equals' AND NEW.value = v_rule.threshold)
    ) THEN
      -- Create alert if one doesn't exist for this rule
      IF NOT EXISTS (
        SELECT 1 FROM alerts
        WHERE rule_id = v_rule.id
          AND status = 'active'
      ) THEN
        INSERT INTO alerts (
          rule_id,
          metric_type,
          severity,
          message,
          value,
          timestamp
        ) VALUES (
          v_rule.id,
          NEW.type,
          v_rule.severity,
          format('Metric %s %s threshold: %s (value: %s)',
            NEW.type,
            v_rule.condition,
            v_rule.threshold,
            NEW.value
          ),
          NEW.value,
          NEW.timestamp
        ) RETURNING id INTO v_alert_id;

        -- Create notification entries
        INSERT INTO alert_notifications (
          alert_id,
          channel,
          status
        )
        SELECT
          v_alert_id,
          key::text,
          'pending'
        FROM jsonb_object_keys(v_rule.notification_channels) AS key
        WHERE (v_rule.notification_channels->key)::boolean = true;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup old metrics
CREATE OR REPLACE FUNCTION cleanup_old_metrics(
  p_retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM metrics
  WHERE timestamp < NOW() - (p_retention_days || ' days')::INTERVAL
  RETURNING COUNT(*) INTO v_deleted;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Create metrics aggregation function
CREATE OR REPLACE FUNCTION aggregate_metrics_window(
  p_window_interval INTERVAL
)
RETURNS void AS $$
DECLARE
  v_last_aggregation TIMESTAMPTZ;
  v_window_start TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
  v_metric metric_type;
BEGIN
  -- Get last aggregation time
  SELECT MAX(end_time)
  INTO v_last_aggregation
  FROM metrics_aggregation;

  IF v_last_aggregation IS NULL THEN
    v_last_aggregation := NOW() - INTERVAL '1 day';
  END IF;

  v_window_start := v_last_aggregation;
  v_window_end := v_window_start + p_window_interval;

  WHILE v_window_end <= NOW() LOOP
    -- Aggregate for each metric type
    FOR v_metric IN SELECT unnest(enum_range(NULL::metric_type)) LOOP
      INSERT INTO metrics_aggregation (
        metric_type,
        window_size,
        start_time,
        end_time,
        min_value,
        max_value,
        avg_value,
        count
      )
      SELECT
        v_metric,
        p_window_interval::text,
        v_window_start,
        v_window_end,
        MIN(value),
        MAX(value),
        AVG(value),
        COUNT(*)
      FROM metrics
      WHERE type = v_metric
        AND timestamp >= v_window_start
        AND timestamp < v_window_end;
    END LOOP;

    v_window_start := v_window_end;
    v_window_end := v_window_start + p_window_interval;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for alert evaluation
CREATE TRIGGER evaluate_alerts_trigger
  AFTER INSERT ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_alert_rules(); 