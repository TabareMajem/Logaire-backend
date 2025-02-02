"use client";

import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export function AgentPerformance() {
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>();

  const { data: performanceData } = useQuery({
    queryKey: ['agent-performance', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange?.from.toISOString() || '',
        to: dateRange?.to.toISOString() || ''
      });
      const response = await fetch(`/api/ai/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
    enabled: !!dateRange
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="successRate" 
              stroke="#10b981" 
              name="Success Rate" 
            />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke="#6366f1" 
              name="Latency" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}