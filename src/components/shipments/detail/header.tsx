// src/components/shipment/detail/header.tsx -->

"use client";

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ShipmentStatus } from '@/components/shipments/shipment-status';
import { ShipmentActions } from '@/components/shipments/shipment-actions';
import type { Shipment } from '@/lib/api/shipments';

interface ShipmentHeaderProps {
  shipment: Shipment;
}

export function ShipmentHeader({ shipment }: ShipmentHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">
            {shipment.reference_number}
          </h1>
          <ShipmentStatus status={shipment.status} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Created {formatDistanceToNow(new Date(shipment.created_at))} ago
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <ShipmentActions shipment={shipment} />
        <Button variant="outline" asChild>
          <Link href="/shipments">Back to List</Link>
        </Button>
      </div>
    </div>
  );
}