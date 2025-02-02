// src/components/shipements/shipment-status.tsx -->

import type { ShipmentStatus } from '@/lib/api/shipments';
import { Badge } from '../../../components/ui/badge';
import { cn } from '@/lib/utils';

interface ShipmentStatusProps {
  status: ShipmentStatus;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-500' },
  booked: { label: 'Booked', color: 'bg-blue-500' },
  in_transit: { label: 'In Transit', color: 'bg-amber-500' },
  customs: { label: 'Customs', color: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
} as const;

export function ShipmentStatus({ status }: ShipmentStatusProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <Badge className={cn(config.color, "text-white")}>
      {config.label}
    </Badge>
  );
}