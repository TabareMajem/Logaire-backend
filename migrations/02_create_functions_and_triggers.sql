-- Function to update model performance metrics
CREATE OR REPLACE FUNCTION update_model_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update success rate
  WITH metrics AS (
    SELECT 
      COUNT(*) as total_executions,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_executions,
      AVG(CASE WHEN status = 'completed' THEN duration ELSE NULL END) as avg_duration
    FROM agent_executions
    WHERE model = NEW.model
      AND agent_type = NEW.agent_type
      AND task_type = NEW.task_type
      AND created_at > NOW() - INTERVAL '30 days'
  )
  INSERT INTO model_performance (
    model_id,
    agent_type,
    task_type,
    success_rate,
    avg_latency,
    cost_per_token,
    sample_size
  )
  SELECT
    NEW.model,
    NEW.agent_type,
    NEW.task_type,
    COALESCE(successful_executions::float / NULLIF(total_executions, 0), 0),
    COALESCE(avg_duration, 0),
    0.0, -- Cost per token would be updated separately
    total_executions
  FROM metrics
  ON CONFLICT (model_id, agent_type, task_type)
  DO UPDATE SET
    success_rate = EXCLUDED.success_rate,
    avg_latency = EXCLUDED.avg_latency,
    sample_size = EXCLUDED.sample_size,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating model metrics
CREATE TRIGGER update_model_metrics_trigger
AFTER INSERT OR UPDATE ON agent_executions
FOR EACH ROW
EXECUTE FUNCTION update_model_metrics();

-- Function to clean up old executions
CREATE OR REPLACE FUNCTION cleanup_old_executions()
RETURNS void AS $$
BEGIN
  -- Archive executions older than 30 days
  INSERT INTO agent_executions_archive
  SELECT *
  FROM agent_executions
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Delete archived executions
  DELETE FROM agent_executions
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('0 0 * * *', $$SELECT cleanup_old_executions()$$);

-- Function to update agent configurations
CREATE OR REPLACE FUNCTION update_agent_config()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate configuration
  IF NEW.settings IS NULL THEN
    RAISE EXCEPTION 'Agent configuration cannot be null';
  END IF;

  -- Set updated timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for agent configuration updates
CREATE TRIGGER validate_agent_config_trigger
BEFORE INSERT OR UPDATE ON agent_configurations
FOR EACH ROW
EXECUTE FUNCTION update_agent_config(); 