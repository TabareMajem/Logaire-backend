"use client";

import { useState } from 'react';
import { APIKeyList } from './api-key-list';
import { CreateAPIKeyDialog } from './create-api-key-dialog';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

export function APIKeyManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Key className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <APIKeyList />
      
      <CreateAPIKeyDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}