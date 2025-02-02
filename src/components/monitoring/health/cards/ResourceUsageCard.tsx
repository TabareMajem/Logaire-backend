// src/components/monitoring/health/cards/ResourceUsageCard.tsx

import { Card } from '../../../../components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface ResourceUsageCardProps {
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    timestamp: string;
  }[];
}

export function ResourceUsageCard({ metrics }: ResourceUsageCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-gray-500">Resource Usage</h3>
      <div className="h-[150px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics}>
            <XAxis dataKey="timestamp" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="cpu" stroke="#10B981" dot={false} />
            <Line type="monotone" dataKey="memory" stroke="#3B82F6" dot={false} />
            <Line type="monotone" dataKey="disk" stroke="#6366F1" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

