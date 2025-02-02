"use client";

import { useState } from 'react';
import { NotificationList } from './notification-list';
import { NotificationFilters } from './notification-filters';
import { NotificationMetrics } from './notification-metrics';
import { CreateNotificationDialog } from './create-notification-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function NotificationManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    severity: ''
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Notification
        </Button>
      </div>

      <NotificationMetrics />
      <NotificationFilters filters={filters} onFilterChange={setFilters} />
      <NotificationList filters={filters} />
      
      <CreateNotificationDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}