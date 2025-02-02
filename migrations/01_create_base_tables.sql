-- Agent Registry
CREATE TABLE agent_registry (
  agent_type VARCHAR(50) PRIMARY KEY,
  capabilities TEXT[] NOT NULL,
  description TEXT NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Configurations
CREATE TABLE agent_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type VARCHAR(50) REFERENCES agent_registry(agent_type),
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt Templates
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type VARCHAR(50) REFERENCES agent_registry(agent_type),
  task_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_type, task_type, version)
);

-- Model Performance
CREATE TABLE model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id VARCHAR(50) NOT NULL,
  agent_type VARCHAR(50) REFERENCES agent_registry(agent_type),
  task_type VARCHAR(50) NOT NULL,
  success_rate FLOAT NOT NULL,
  avg_latency INTEGER NOT NULL,
  cost_per_token FLOAT NOT NULL,
  sample_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Executions
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type VARCHAR(50) REFERENCES agent_registry(agent_type),
  task_type VARCHAR(50) NOT NULL,
  task_data JSONB NOT NULL,
  model VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  result JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  confidence FLOAT,
  duration INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_model_performance_model ON model_performance(model_id); 