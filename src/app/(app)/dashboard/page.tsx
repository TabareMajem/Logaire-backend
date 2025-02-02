// src/app/(app)/dashboard/page.tsx

"use client";

import { DashboardMetrics } from '../../../components/dashboard/metrics/metrics-grid';
import { QuickActionsPanel } from '../../../components/dashboard/quick-actions/quick-actions-panel';
import { ActivityFeed } from '../../../components/dashboard/activity/activity-feed';
import { Card } from '../../../../components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.email}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your shipments today.
        </p>
      </Card>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardMetrics />
        <div className="grid gap-6 md:grid-cols-2">
          <QuickActionsPanel />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

