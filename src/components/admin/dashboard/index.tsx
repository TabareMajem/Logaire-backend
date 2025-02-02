"use client";

import { AdminMetrics } from './metrics';
import { RecentUsers } from './recent-users';
import { SubscriptionOverview } from './subscription-overview';
import { SystemStatus } from './system-status';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <AdminMetrics />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RecentUsers />
        <SubscriptionOverview />
      </div>
      
      <SystemStatus />
    </div>
  );
}