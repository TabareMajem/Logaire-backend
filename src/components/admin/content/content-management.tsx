// src/components/admin/content/content-management.tsx -->

"use client";

import { useState } from 'react';
import { ContentList } from './content-list';
import { ContentFilters } from './content-filters';
import { CreateContentDialog } from './create-content-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ContentManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </div>

      <ContentFilters filters={filters} onFilterChange={setFilters} />
      <ContentList filters={filters} />
      
      <CreateContentDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}