-- Enable RLS on all tables
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_aggregation ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for metrics
CREATE POLICY "Allow read access to metrics for authenticated users"
  ON metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to metrics for service role"
  ON metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policies for alert rules
CREATE POLICY "Allow read access to alert rules for authenticated users"
  ON alert_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow full access to alert rules for admin users"
  ON alert_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Create policies for alerts
CREATE POLICY "Allow read access to alerts for authenticated users"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow update access to alerts for authenticated users"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    acknowledged_by = auth.uid() OR
    resolved_by = auth.uid()
  );

-- Create policies for user preferences
CREATE POLICY "Allow users to manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for dashboard layouts
CREATE POLICY "Allow users to manage their own dashboard layouts"
  ON user_dashboard_layouts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for notification settings
CREATE POLICY "Allow users to manage their own notification settings"
  ON notification_settings FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for monitoring agents
CREATE POLICY "Allow read access to monitoring agents for authenticated users"
  ON monitoring_agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow full access to monitoring agents for admin users"
  ON monitoring_agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  ); 