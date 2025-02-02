-- Collaboration Messages Table
CREATE TABLE collaboration_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  from_agent_id TEXT NOT NULL,
  to_agent_id TEXT,
  content JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_message_type CHECK (type IN ('request', 'response', 'broadcast', 'error', 'status'))
);

-- Collaboration Metrics Table
CREATE TABLE collaboration_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  message_count INTEGER NOT NULL DEFAULT 0,
  average_response_time FLOAT,
  success_rate FLOAT,
  error_rate FLOAT,
  active_collaborations INTEGER,
  resource_usage JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Task Assignments Table
CREATE TABLE agent_task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'))
);

-- Indexes
CREATE INDEX idx_collaboration_messages_workflow ON collaboration_messages(workflow_id);
CREATE INDEX idx_collaboration_metrics_workflow ON collaboration_metrics(workflow_id);
CREATE INDEX idx_agent_tasks_workflow ON agent_task_assignments(workflow_id);
CREATE INDEX idx_agent_tasks_agent ON agent_task_assignments(agent_id); 