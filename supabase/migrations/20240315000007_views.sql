-- Create view for metric statistics
CREATE OR REPLACE VIEW metric_statistics AS
SELECT
  type as metric_type,
  COUNT(*) as total_measurements,
  MIN(value) as min_value,
  MAX(value) as max_value,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  MIN(timestamp) as first_measurement,
  MAX(timestamp) as last_measurement
FROM metrics
GROUP BY type;

-- Create view for alert statistics
CREATE OR REPLACE VIEW alert_statistics AS
SELECT
  metric_type,
  severity,
  status,
  COUNT(*) as alert_count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))) as avg_resolution_time_seconds
FROM alerts
GROUP BY metric_type, severity, status;

-- Create view for active alerts with rules
CREATE OR REPLACE VIEW active_alerts_with_rules AS
SELECT
  a.id as alert_id,
  a.metric_type,
  a.severity,
  a.message,
  a.value,
  a.timestamp,
  ar.condition,
  ar.threshold,
  ar.description as rule_description,
  a.created_at,
  a.acknowledged_at,
  u.email as acknowledged_by_email
FROM alerts a
JOIN alert_rules ar ON a.rule_id = ar.id
LEFT JOIN auth.users u ON a.acknowledged_by = u.id
WHERE a.status = 'active';

-- Create view for user notification preferences
CREATE OR REPLACE VIEW user_notification_preferences AS
SELECT
  u.id as user_id,
  u.email,
  up.monitoring_config->'notifications' as notification_settings,
  up.alert_preferences->'notificationThresholds' as alert_thresholds,
  ns.channel,
  ns.enabled as channel_enabled,
  ns.config as channel_config
FROM auth.users u
LEFT JOIN user_preferences up ON u.id = up.user_id
LEFT JOIN notification_settings ns ON u.id = ns.user_id; 