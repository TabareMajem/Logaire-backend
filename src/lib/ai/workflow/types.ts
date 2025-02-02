 // src/lib/ai/workflow/types.ts

export type WorkflowStatus = 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowStep {
    id: string;
    workflow_id: string;
    name: string;
    description?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    order: number;
    dependencies: string[]; // Add this
    agentId: string; // Add this
    started_at?: string;
    completed_at?: string;
    error?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
  }

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  created_by: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  steps?: WorkflowStep[];
}

// Types for workflow analytics
export interface WorkflowMetrics {
  id: string;
  workflow_id: string;
  total_duration: number;
  step_durations: Record<string, number>;
  error_count: number;
  created_at: string;
}

// Types for workflow configuration
export interface WorkflowConfig {
  id: string;
  workflow_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Types for workflow permissions
export interface WorkflowPermission {
  id: string;
  workflow_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}