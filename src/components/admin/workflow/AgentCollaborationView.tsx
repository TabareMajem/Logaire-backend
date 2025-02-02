import { Badge } from '../../../../components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAgentCollaboration } from '@/hooks/useAgentCollaboration';
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

interface AgentCollaborationViewProps {
  workflowId: string;
}

export function AgentCollaborationView({ workflowId }: AgentCollaborationViewProps) {
  const { data, isLoading, error } = useAgentCollaboration(workflowId);

  if (isLoading) {
    return <div>Loading collaboration data...</div>;
  }

  if (error) {
    return <div>Error loading collaboration data: {error.message}</div>;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Collaborations"
          value={data.activeCollaborations}
          trend={data.collaborationTrend}
        />
        <MetricCard
          title="Message Success Rate"
          value={`${(data.messageSuccessRate * 100).toFixed(1)}%`}
          trend={data.successRateTrend}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${data.avgResponseTime.toFixed(2)}ms`}
          trend={data.responseTrend}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Message Flow</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.messageHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                stroke="#3B82F6"
                name="Messages Sent"
              />
              <Line
                type="monotone"
                dataKey="received"
                stroke="#10B981"
                name="Messages Received"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Active Agents</h3>
          <div className="space-y-4">
            {data.activeAgents?.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-gray-500">{agent.type}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                  <div className="text-sm text-gray-500">Load: {agent.currentLoad}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Messages</h3>
          <div className="space-y-2">
            {data.recentMessages?.map((message) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <Badge variant={getMessageVariant(message.type)}>
                    {message.type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  {message.from} → {message.to || 'broadcast'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend }: {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
}) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className={`text-sm mt-2 ${getTrendColor(trend)}`}>
        {getTrendIcon(trend)} {trend}
      </div>
    </Card>
  );
}

function getMessageVariant(type: string): 'default' | 'secondary' | 'destructive' {
  switch (type) {
    case 'error':
      return 'destructive';
    case 'broadcast':
      return 'secondary';
    default:
      return 'default';
  }
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
} 