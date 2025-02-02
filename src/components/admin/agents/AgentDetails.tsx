import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { AgentConfig, AgentStatus } from '@/types/agents';
import { useState } from 'react';
import { AgentLogs } from './AgentLogs';
import { AgentMetricsChart } from './AgentMetricsChart';

interface AgentDetailsProps {
  agent: {
    config: AgentConfig;
    status: AgentStatus;
    metrics: {
      requestsPerMinute: number[];
      latencies: number[];
      errorRates: number[];
      timestamps: string[];
    };
    logs: Array<{
      timestamp: string;
      level: 'info' | 'warn' | 'error';
      message: string;
    }>;
  };
  onEdit: () => void;
  onRestart: () => void;
}

export function AgentDetails({ agent, onEdit, onRestart }: AgentDetailsProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs'>('metrics');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{agent.config.name}</h2>
          <p className="text-muted-foreground">{agent.config.description}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Configuration
          </Button>
          <Button onClick={onRestart}>Restart Agent</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Status</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Current State:</span>{' '}
              {agent.status.status}
            </div>
            {agent.status.errorMessage && (
              <div className="text-destructive text-sm">
                {agent.status.errorMessage}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Configuration</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span> {agent.config.type}
            </div>
            <div>
              <span className="text-muted-foreground">Model:</span>{' '}
              {agent.config.model}
            </div>
            <div>
              <span className="text-muted-foreground">Temperature:</span>{' '}
              {agent.config.temperature}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Performance</h3>
          <div className="space-y-2 text-sm">
            {agent.status.performance && (
              <>
                <div>
                  <span className="text-muted-foreground">Requests:</span>{' '}
                  {agent.status.performance.requestsProcessed}
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Latency:</span>{' '}
                  {agent.status.performance.averageLatency}ms
                </div>
                <div>
                  <span className="text-muted-foreground">Error Rate:</span>{' '}
                  {agent.status.performance.errorRate}%
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4 border-b">
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === 'metrics'
                ? 'border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
          <button
            className={`pb-2 text-sm font-medium ${
              activeTab === 'logs'
                ? 'border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
        </div>

        {activeTab === 'metrics' ? (
          <AgentMetricsChart
            metrics={agent.metrics}
            title="Agent Performance"
          />
        ) : (
          <AgentLogs logs={agent.logs} />
        )}
      </div>
    </div>
  );
} 