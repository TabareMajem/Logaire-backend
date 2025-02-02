// src/components/shipments/detail/tabs/overview.tsx -->

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationDisplay } from '@/components/shipments/location-display';
import type { Shipment } from '@/lib/api/shipments';

interface ShipmentOverviewProps {
  shipment: Shipment;
}

export function ShipmentOverview({ shipment }: ShipmentOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Route Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Origin</p>
            <LocationDisplay location={shipment.origin} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Destination</p>
            <LocationDisplay location={shipment.destination} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cargo Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p>{shipment.cargo.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Weight</p>
              <p>{shipment.cargo.weight} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Volume</p>
              <p>{shipment.cargo.volume} m³</p>
            </div>
          </div>
          {shipment.cargo.container_type && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Container</p>
              <p>{shipment.cargo.container_type}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}