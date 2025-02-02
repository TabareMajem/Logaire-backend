"use client";

import { useState } from 'react';
import { SubscriptionList } from './subscription-list';
import { SubscriptionFilters } from './subscription-filters';
import { SubscriptionMetrics } from './subscription-metrics';
import { CreatePlanDialog } from './create-plan-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function SubscriptionManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    plan: ''
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <SubscriptionMetrics />
      <SubscriptionFilters filters={filters} onFilterChange={setFilters} />
      <SubscriptionList filters={filters} />
      
      <CreatePlanDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}