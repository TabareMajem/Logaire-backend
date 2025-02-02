// src/components/shipments/detail/tracking/event-icon.tsx -->

"use client";

import { Package, Truck, Ship, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingEventIconProps {
  type: string;
  className?: string;
}

const iconMap = {
  pickup: Package,
  departure: Truck,
  vessel_departure: Ship,
  vessel_arrival: Ship,
  flight_departure: Plane,
  flight_arrival: Plane,
  arrival: Truck,
  delivery: Package,
} as const;

export function TrackingEventIcon({ type, className }: TrackingEventIconProps) {
  const Icon = iconMap[type as keyof typeof iconMap] || Package;

  return (
    <div className={cn(
      "h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center",
      className
    )}>
      <Icon className="h-3 w-3 text-primary" />
    </div>
  );
}