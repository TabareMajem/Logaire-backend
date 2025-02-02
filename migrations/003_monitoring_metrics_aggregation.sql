-- Create table for aggregated metrics
CREATE TABLE metric_aggregations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type metric_type NOT NULL,
  window_size interval NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  min_value DOUBLE PRECISION NOT NULL,
  max_value DOUBLE PRECISION NOT NULL,
  avg_value DOUBLE PRECISION NOT NULL,
  count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_metric_aggregations_type_window 
  ON metric_aggregations(metric_type, window_size, start_time);

-- Create function to aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_metrics(
  p_window_size interval,
  p_metric_type metric_type
)
RETURNS void AS $$
BEGIN
  INSERT INTO metric_aggregations (
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
    type as metric_type,
    p_window_size as window_size,
    date_trunc('hour', timestamp) as start_time,
    date_trunc('hour', timestamp) + p_window_size as end_time,
    MIN(value) as min_value,
    MAX(value) as max_value,
    AVG(value) as avg_value,
    COUNT(*) as count
  FROM metrics
  WHERE type = p_metric_type
  AND timestamp >= NOW() - p_window_size
  GROUP BY
    type,
    date_trunc('hour', timestamp)
  ON CONFLICT (id) DO UPDATE
  SET
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    avg_value = EXCLUDED.avg_value,
    count = EXCLUDED.count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old aggregations
CREATE OR REPLACE FUNCTION cleanup_old_aggregations(
  p_retention_days integer DEFAULT 30
)
RETURNS void AS $$
BEGIN
  DELETE FROM metric_aggregations
  WHERE end_time < NOW() - (p_retention_days || ' days')::interval;
END;
$$ LANGUAGE plpgsql; 