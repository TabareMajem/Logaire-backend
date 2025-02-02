// src/components/shipments/details/costs/cost-summary.tsx -->

"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { ShipmentCost } from '@/lib/api/costs';
import { formatCurrency } from '@/lib/utils/format';

interface CostSummaryProps {
  costs?: ShipmentCost[];
}

export function CostSummary({ costs }: CostSummaryProps) {
  const summary = useMemo(() => {
    if (!costs) return {};
    
    return costs.reduce((acc, cost) => {
      if (!acc[cost.currency]) {
        acc[cost.currency] = {
          total: 0,
          pending: 0,
          paid: 0
        };
      }
      acc[cost.currency].total += cost.amount;
      if (cost.status === 'pending') {
        acc[cost.currency].pending += cost.amount;
      } else if (cost.status === 'paid') {
        acc[cost.currency].paid += cost.amount;
      }
      return acc;
    }, {} as Record<string, { total: number; pending: number; paid: number }>);
  }, [costs]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Object.entries(summary).map(([currency, amounts]) => (
        <Card key={currency}>
          <CardHeader>
            <CardTitle className="text-lg">{currency} Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">{formatCurrency(amounts.total, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-medium text-yellow-600">
                {formatCurrency(amounts.pending, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(amounts.paid, currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}