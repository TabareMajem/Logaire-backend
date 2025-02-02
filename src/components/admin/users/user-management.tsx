// src/components/admin/users/user-management.tsx -->

"use client";

import { useState } from 'react';
import { UserList } from './user-list';
import { UserFilters } from './user-filters';
import { CreateUserDialog } from './create-user-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function UserManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UserFilters filters={filters} onFilterChange={setFilters} />
      <UserList filters={filters} />
      
      <CreateUserDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}