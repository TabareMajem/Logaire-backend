// src/components/shipments/detail/tabs.tsx -->

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ShipmentOverview } from './tabs/overview';
import { ShipmentTracking } from './tabs/tracking';
import { ShipmentDocuments } from './tabs/documents';
import { ShipmentCosts } from './tabs/costs';
import type { Shipment } from '@/lib/api/shipments';

interface ShipmentTabsProps {
  shipment: Shipment;
}

export function ShipmentTabs({ shipment }: ShipmentTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="costs">Costs</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ShipmentOverview shipment={shipment} />
      </TabsContent>

      <TabsContent value="tracking">
        <ShipmentTracking shipmentId={shipment.id} />
      </TabsContent>

      <TabsContent value="documents">
        <ShipmentDocuments shipmentId={shipment.id} />
      </TabsContent>

      <TabsContent value="costs">
        <ShipmentCosts shipmentId={shipment.id} />
      </TabsContent>
    </Tabs>
  );
}