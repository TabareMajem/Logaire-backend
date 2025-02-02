"use client";

import { Suspense } from 'react';
import { ShipmentsChart } from './shipments-chart';
import { PerformanceChart } from './performance-chart';
import { Card } from '@/components/ui/card';

function ChartSkeleton() {
  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-9 w-[140px] bg-muted animate-pulse rounded" />
        </div>
        <div className="h-[350px] bg-muted animate-pulse rounded" />
      </div>
    </Card>
  );
}

export function ChartsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Suspense fallback={<ChartSkeleton />}>
        <ShipmentsChart />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <PerformanceChart />
      </Suspense>
    </div>
  );
}