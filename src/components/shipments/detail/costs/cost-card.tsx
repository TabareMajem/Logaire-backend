// src/components/shipments/details/costs/cost-card.tsx -->

"use client";

import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react';
import { ShipmentCost, updateCostStatus } from '@/lib/api/costs';
import { CostTypeIcon } from './cost-type-icon';
import { CostStatus } from './cost-status';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils/format';

interface CostCardProps {
  cost: ShipmentCost;
  shipmentId: string;
}

export function CostCard({ cost, shipmentId }: CostCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentCost['status'] }) =>
      updateCostStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shipment-costs', shipmentId]});
      toast.success('Cost status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update cost status');
    }
  });

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="p-2 bg-muted rounded-lg">
        <CostTypeIcon type={cost.cost_type} className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{cost.description}</h4>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{formatCurrency(cost.amount, cost.currency)}</span>
              {cost.invoice_number && (
                <>
                  <span>•</span>
                  <span>Invoice: {cost.invoice_number}</span>
                </>
              )}
              <span>•</span>
              <span>{formatDistanceToNow(new Date(cost.created_at))} ago</span>
            </div>
            {cost.vendor && (
              <p className="text-sm text-muted-foreground mt-1">
                Vendor: {cost.vendor.name}
              </p>
            )}
          </div>
          <CostStatus status={cost.status} />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updateStatus({ id: cost.id, status: 'approved' })}>
            Mark as Approved
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus({ id: cost.id, status: 'paid' })}>
            Mark as Paid
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updateStatus({ id: cost.id, status: 'cancelled' })}>
            Cancel Cost
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}