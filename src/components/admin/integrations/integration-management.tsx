// src/components/admin/integrations/integration-management.tsx -->

"use client";

import { useState } from 'react';
import { IntegrationList } from './integration-list';
import { IntegrationFilters } from './integration-filters';
import { IntegrationMetrics } from './integration-metrics';
import { CreateIntegrationDialog } from './create-integration-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function IntegrationManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integration Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <IntegrationMetrics />
      <IntegrationFilters filters={filters} onFilterChange={setFilters} />
      <IntegrationList filters={filters} />
      
      <CreateIntegrationDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}