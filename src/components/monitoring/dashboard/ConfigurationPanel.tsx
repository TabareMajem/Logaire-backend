import { ErrorBoundary } from '@/components/error-boundary';
import { Card } from '@/components/ui/card';
import { MonitoringConfigPanel } from '../config/MonitoringConfigPanel';

export function ConfigurationPanel() {
  return (
    <ErrorBoundary>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Configuration</h2>
          </div>
          <MonitoringConfigPanel />
        </div>
      </Card>
    </ErrorBoundary>
  );
} 