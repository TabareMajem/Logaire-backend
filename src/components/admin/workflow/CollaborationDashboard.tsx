// src/components/admin/workflow/CollaborationDashboard.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useCollaboration } from '@/hooks/useCollaboration';
import { AlertCircle, MessageSquare, Users } from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Key, ReactElement, JSXElementConstructor, ReactNode, AwaitedReactNode, ReactPortal } from 'react';

interface CollaborationDashboardProps {
  workflowId: string;
}

export function CollaborationDashboard({ workflowId }: CollaborationDashboardProps) {
  const {
    data,
    activeAgents,
    messages,
    metrics,
    error,
    isLoading,
    sendMessage,
    assignTask
  } = useCollaboration(workflowId);

  if (isLoading) {
    return <div>Loading collaboration data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Active Agents</div>
              <div className="text-2xl font-semibold">{activeAgents.length}</div>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Messages</div>
              <div className="text-2xl font-semibold">{messages.length}</div>
            </div>
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Success Rate</div>
              <div className="text-2xl font-semibold">
                {(metrics.successRate * 100).toFixed(1)}%
              </div>
            </div>
            <Badge variant={metrics.successRate > 0.9 ? 'default' : 'destructive'}>
              {metrics.successRate > 0.9 ? 'Healthy' : 'Attention Needed'}
            </Badge>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Active Agents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card className="p-6">
            <div className="space-y-4">
              {activeAgents.map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.type}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      Load: {agent.currentLoad}%
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => assignTask({ agentId: agent.id, task: agent })}
                    >
                      Assign Task
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="p-6">
            <div className="space-y-4">
              {messages.map((message: { id: Key | null | undefined; type: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> | null | undefined; metadata: { timestamp: string | number | Date; }; from: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; to: any; content: any; }) => (
                <div
                  key={message.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={message.type === 'error' ? 'destructive' : 'default'}>
                      {message.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(message.metadata.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">
                      From: {message.from} {message.to ? `→ ${message.to}` : '(broadcast)'}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {JSON.stringify(message.content)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    name="Response Time"
                    stroke="#3B82F6"
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="#10B981"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 