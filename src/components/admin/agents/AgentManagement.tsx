import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { useAgents } from '@/hooks/useAgents';
import { AgentConfig } from '@/types/agents';
import { useState } from 'react';
import { AgentConfigForm } from './AgentConfigForm';
import { AgentList } from './AgentList';
import { AgentMetrics } from '@/components/ai/dashboard/agent-metrics';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: {
    status: 'idle' | 'processing' | 'error';
    performance?: {
      requestsProcessed: number;
      averageLatency: number;
      errorRate: number;
    };
  };
  lastActive: string;
}

export function AgentManagement() {
  const { agents, updateAgent, deleteAgent, createAgent } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleCreateAgent = async (config: AgentConfig) => {
    await createAgent(config);
    setIsConfigOpen(false);
  };

  const handleUpdateAgent = async (id: string, config: Partial<AgentConfig>) => {
    await updateAgent(id, config);
    setSelectedAgent(null);
  };

  const handleDeleteAgent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      await deleteAgent(id);
      setSelectedAgent(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Agent Management</h2>
        <Button onClick={() => setIsConfigOpen(true)}>
          Create New Agent
        </Button>
      </div>

      <Card className="p-6">
        <AgentList
          agents={agents as unknown as Agent[]}  // Explicitly cast the agents to `Agent[]`
          onSelect={setSelectedAgent}
          onDelete={handleDeleteAgent}
        />
      </Card>

      {selectedAgent && (
        <Card className="p-6">
          <AgentMetrics agentId={selectedAgent} />
        </Card>
      )}

      <Dialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
      >
        <AgentConfigForm
          onSubmit={handleCreateAgent}
          onCancel={() => setIsConfigOpen(false)}
        />
      </Dialog>
    </div>
  );
}
