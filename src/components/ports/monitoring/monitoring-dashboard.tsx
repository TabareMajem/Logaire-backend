// src/components/ports/monitoring/monitoring-dashboard.tsx -->

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { PortStatusGrid } from './port-status-grid';
import { CongestionChart } from './congestion-chart';
import { VesselMovements } from './vessel-movements';
import { usePortMonitoring } from '@/hooks/use-port-monitoring';
import { Badge } from '../../../../components/ui/badge';

export function PortMonitoringDashboard() {
  const { 
    portStatuses,
    congestionData,
    isLoading,
    isMonitoring 
  } = usePortMonitoring();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Port Operations</h2>
        {/* <Badge variant={isMonitoring ? 'success' : 'destructive'}>
          {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
        </Badge> */}
        <Badge variant={isMonitoring ? 'default' : 'destructive'}>
          {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
        </Badge>
      </div>

      <PortStatusGrid 
        statuses={portStatuses || {}} 
        loading={isLoading} 
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Congestion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <CongestionChart 
              data={congestionData || []}
              loading={isLoading}
            /> */}
            <CongestionChart 
              data={congestionData ?? { portId: "default", updates: [] }} // Provide default value with correct shape
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <VesselMovements portId="PORT123" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terminal Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedules">
            <TabsList>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>
            <TabsContent value="schedules">
              {/* Terminal schedules content */}
            </TabsContent>
            <TabsContent value="appointments">
              {/* Appointments content */}
            </TabsContent>
            <TabsContent value="equipment">
              {/* Equipment status content */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}