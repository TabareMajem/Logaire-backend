/*
  AI System Schema Migration
  
  Tables:
  1. agent_executions - Track all agent executions
  2. agent_metrics - Store performance metrics
  3. agent_configurations - Store agent settings
  4. model_performance - Track model performance
  5. prompt_templates - Store and manage prompts
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create agent_executions table
CREATE TABLE IF NOT EXISTS public.agent_executions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type text NOT NULL,
  task_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  task_data jsonb NOT NULL,
  result jsonb,
  error text,
  success boolean,
  confidence numeric,
  duration integer, -- in milliseconds
  model text,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_metrics table
CREATE TABLE IF NOT EXISTS public.agent_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type text NOT NULL,
  request_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  total_duration bigint DEFAULT 0, -- in milliseconds
  average_confidence numeric DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create agent_configurations table
CREATE TABLE IF NOT EXISTS public.agent_configurations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type text NOT NULL UNIQUE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_settings jsonb NOT NULL DEFAULT '{
    "default_model": "claude-3-sonnet-20240229",
    "fallback_model": "claude-3-haiku-20240307",
    "max_tokens": 1024,
    "temperature": 0.7
  }'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create model_performance table
CREATE TABLE IF NOT EXISTS public.model_performance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model text NOT NULL,
  task_type text NOT NULL,
  success_rate numeric DEFAULT 0,
  average_latency integer DEFAULT 0,
  total_tokens bigint DEFAULT 0,
  total_cost numeric DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  template text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON agent_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_type ON agent_metrics(agent_type);
CREATE INDEX IF NOT EXISTS idx_model_performance_model ON model_performance(model);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(active);

-- Enable Row Level Security
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ BEGIN
  -- Agent Executions policies
  CREATE POLICY "Users can view their own executions"
    ON agent_executions FOR SELECT
    TO authenticated
    USING (created_by = auth.uid());

  CREATE POLICY "Admins can view all executions"
    ON agent_executions FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id 
        AND role = 'admin'
      )
    );

  -- Agent Metrics policies
  CREATE POLICY "Authenticated users can view metrics"
    ON agent_metrics FOR SELECT
    TO authenticated
    USING (true);

  -- Agent Configurations policies
  CREATE POLICY "Admins can manage configurations"
    ON agent_configurations FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id 
        AND role = 'admin'
      )
    );

  CREATE POLICY "Users can view configurations"
    ON agent_configurations FOR SELECT
    TO authenticated
    USING (true);

  -- Model Performance policies
  CREATE POLICY "Authenticated users can view model performance"
    ON model_performance FOR SELECT
    TO authenticated
    USING (true);

  -- Prompt Templates policies
  CREATE POLICY "Admins can manage prompt templates"
    ON prompt_templates FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id 
        AND role = 'admin'
      )
    );

  CREATE POLICY "Users can view active prompt templates"
    ON prompt_templates FOR SELECT
    TO authenticated
    USING (active = true);
END $$;

-- Create functions for metrics aggregation
CREATE OR REPLACE FUNCTION get_agent_metrics(agent_type_param text)
RETURNS TABLE (
  request_count bigint,
  success_rate numeric,
  average_latency numeric,
  error_rate numeric
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as request_count,
    (SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100) as success_rate,
    AVG(duration)::numeric as average_latency,
    (SUM(CASE WHEN NOT success THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100) as error_rate
  FROM agent_executions
  WHERE agent_type = agent_type_param
  AND created_at >= NOW() - INTERVAL '24 hours';
END;
$$; 