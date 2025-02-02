"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { Icons } from '@/components/ui/icons';
import { LucideIcon } from 'lucide-react';

export interface Metric {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  formatter?: (value: number) => string;
}

export interface DashboardMetrics {
  activeShipments: number;
  completedShipments: number;
  onTimeDelivery: number;
  totalRevenue: number;
  pendingBookings: number;
  previousMetrics: {
    activeShipments: number;
    completedShipments: number;
    onTimeDelivery: number;
    totalRevenue: number;
    pendingBookings: number;
  };
}

export async function fetchDashboardMetrics(): Promise<Metric[]> {
  try {
    
    const { data, error } = await supabase
      .rpc('get_dashboard_metrics')
      .single();

    if (error) throw error;

    const metrics = transformMetrics(data as DashboardMetrics);
    return metrics;
  } catch (error) {
    ErrorLogger.error('Failed to fetch dashboard metrics', error as Error);
    throw error;
  }
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
}

function determineChangeType(change: number): 'increase' | 'decrease' | 'neutral' {
  if (change > 0) return 'increase';
  if (change < 0) return 'decrease';
  return 'neutral';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function transformMetrics(data: DashboardMetrics): Metric[] {
  return [
    {
      id: 'active-shipments',
      title: 'Active Shipments',
      value: data.activeShipments,
      change: calculateChange(data.activeShipments, data.previousMetrics.activeShipments),
      changeType: determineChangeType(calculateChange(data.activeShipments, data.previousMetrics.activeShipments)),
      icon: Icons.ship,
    },
    {
      id: 'completed-shipments',
      title: 'Completed Shipments',
      value: data.completedShipments,
      change: calculateChange(data.completedShipments, data.previousMetrics.completedShipments),
      changeType: determineChangeType(calculateChange(data.completedShipments, data.previousMetrics.completedShipments)),
      icon: Icons.checkCircle,
    },
    {
      id: 'on-time-delivery',
      title: 'On-Time Delivery',
      value: formatPercentage(data.onTimeDelivery),
      change: calculateChange(data.onTimeDelivery, data.previousMetrics.onTimeDelivery),
      changeType: determineChangeType(calculateChange(data.onTimeDelivery, data.previousMetrics.onTimeDelivery)),
      icon: Icons.timer,
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      change: calculateChange(data.totalRevenue, data.previousMetrics.totalRevenue),
      changeType: determineChangeType(calculateChange(data.totalRevenue, data.previousMetrics.totalRevenue)),
      icon: Icons.dollarSign,
    },
  ];
}