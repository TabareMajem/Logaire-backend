  // src/components/shipments/details/costs/cost-list.tsx-->

  "use client";

  import { ShipmentCost } from '@/lib/api/costs';
  import { CostCard } from './cost-card';
  import { CostListSkeleton } from './cost-list-skeleton';

  interface CostListProps {
    costs?: ShipmentCost[];
    isLoading: boolean;
    shipmentId: string;
  }

  export function CostList({ costs, isLoading, shipmentId }: CostListProps) {
    if (isLoading) {
      return <CostListSkeleton />;
    }

    if (!costs?.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No costs recorded yet
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {costs.map((cost) => (
          <CostCard 
            key={cost.id} 
            cost={cost}
            shipmentId={shipmentId}
          />
        ))}
      </div>
    );
  }