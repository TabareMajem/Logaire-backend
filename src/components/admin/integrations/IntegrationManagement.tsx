import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Integration } from '@/types/integrations';
import { useState } from 'react';
import { IntegrationConfigDialog } from './IntegrationConfigDialog';
import { IntegrationDetails } from './IntegrationDetails';
import { IntegrationList } from './IntegrationList';

export function IntegrationManagement() {
  const { integrations, isLoading, createIntegration, updateIntegration, deleteIntegration } = useIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleCreateIntegration = async (config: Integration) => {
    await createIntegration(config);
    setIsConfigOpen(false);
  };

  const handleUpdateIntegration = async (id: string, updates: Partial<Integration>) => {
    await updateIntegration(id, updates);
    setSelectedIntegration(null);
  };

  const handleDeleteIntegration = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      await deleteIntegration(id);
      setSelectedIntegration(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Integration Management</h2>
            <Button disabled>Add Integration</Button>
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Integration Management</h2>
        <Button onClick={() => setIsConfigOpen(true)}>
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <IntegrationList
            integrations={integrations}
            onSelect={setSelectedIntegration}
            onDelete={handleDeleteIntegration}
          />
        </Card>

        {selectedIntegration && (
          <Card className="p-6">
            <IntegrationDetails
              integration={selectedIntegration}
              onUpdate={handleUpdateIntegration}
            />
          </Card>
        )}
      </div>

      <IntegrationConfigDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        onSubmit={handleCreateIntegration}
      />
    </div>
  );
} 