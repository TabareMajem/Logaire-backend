// src/components/shipments/detail/tabs/costs.tsx --?

"use client";

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { CostSummary } from '../costs/cost-summary';
import { CostList } from '../costs/cost-list';
import { AddCostButton } from '../costs/add-cost-button';
import { fetchShipmentCosts } from '@/lib/api/costs';

interface ShipmentCostsProps {
  shipmentId: string;
}

export function ShipmentCosts({ shipmentId }: ShipmentCostsProps) {
  const { data: costs, isLoading } = useQuery({
    queryKey: ['shipment-costs', shipmentId],
    queryFn: () => fetchShipmentCosts(shipmentId)
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Costs & Charges</h2>
        <AddCostButton shipmentId={shipmentId} />
      </div>

      <CostSummary costs={costs} />

      <Card className="p-6">
        <CostList 
          costs={costs} 
          isLoading={isLoading}
          shipmentId={shipmentId}
        />
      </Card>
    </div>
  );
}