-- Agent-related tables
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agent_configs(id),
  model VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  result JSONB NOT NULL,
  processing_time INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  feedback FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  template TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  effectiveness FLOAT NOT NULL DEFAULT 1.0,
  embedding vector(1536),
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_prompt_templates(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  key VARCHAR,
  template TEXT,
  variables JSONB,
  effectiveness FLOAT,
  embedding vector(1536),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.key,
    t.template,
    t.variables,
    t.effectiveness,
    t.embedding,
    1 - (t.embedding <=> query_embedding) as similarity
  FROM prompt_templates t
  WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Indexes for performance
CREATE INDEX idx_agent_interactions_agent_id ON agent_interactions(agent_id);
CREATE INDEX idx_agent_interactions_created_at ON agent_interactions(created_at);
CREATE INDEX idx_prompt_templates_key ON prompt_templates(key);
CREATE INDEX idx_prompt_templates_embedding ON prompt_templates USING ivfflat (embedding vector_cosine_ops); 