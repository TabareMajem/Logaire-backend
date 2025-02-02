// src/components/monitoring/health/cards/PerformanceCard.tsx

import { Card } from '../../../../components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface PerformanceCardProps {
  metrics: {
    latency: number;
    errorRate: number;
    timestamp: string;
  }[];
}

export function PerformanceCard({ metrics }: PerformanceCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-gray-500">Performance</h3>
      <div className="h-[150px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics}>
            <XAxis dataKey="timestamp" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="latency" stroke="#F59E0B" dot={false} />
            <Line type="monotone" dataKey="errorRate" stroke="#EF4444" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}