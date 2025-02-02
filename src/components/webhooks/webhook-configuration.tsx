// src/components/webhooks/webhook-configuration.tsx -->

"use client";

import { useState } from 'react';
import { WebhookList } from './webhook-list';
import { CreateWebhookDialog } from './create-webhook-dialog';
import { Button } from '@/components/ui/button';
import { Webhook } from 'lucide-react';

export function WebhookConfiguration() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Webhook className="mr-2 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      <WebhookList />
      
      <CreateWebhookDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}