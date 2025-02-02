import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface ComponentHealthProps {
  name: string;
  component: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    errorRate?: number;
    lastCheck: Date;
    message?: string;
  };
  selected: boolean;
  onClick: () => void;
}

export function ComponentHealth({ name, component, selected, onClick }: ComponentHealthProps) {
  const statusColors = {
    healthy: 'bg-green-50 border-green-200 text-green-700',
    degraded: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    unhealthy: 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <motion.div
      layout
      animate={{ height: selected ? 'auto' : '64px' }}
      className={`p-4 rounded-lg border cursor-pointer transition-colors
        ${statusColors[component.status]} ${selected ? 'shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium capitalize">{name}</h3>
          <p className="text-xs opacity-75">
            Last checked {formatDistanceToNow(new Date(component.lastCheck))} ago
          </p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-25">
          {component.status}
        </span>
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 space-y-3"
        >
          {component.latency !== undefined && (
            <div>
              <span className="text-xs font-medium">Latency</span>
              <div className="flex items-center mt-1">
                <div className="flex-1 h-2 bg-white bg-opacity-25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current transition-all"
                    style={{
                      width: `${Math.min((component.latency / 1000) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="ml-2 text-xs">{component.latency}ms</span>
              </div>
            </div>
          )}

          {component.errorRate !== undefined && (
            <div>
              <span className="text-xs font-medium">Error Rate</span>
              <div className="flex items-center mt-1">
                <div className="flex-1 h-2 bg-white bg-opacity-25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current transition-all"
                    style={{ width: `${component.errorRate * 100}%` }}
                  />
                </div>
                <span className="ml-2 text-xs">
                  {(component.errorRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {component.message && (
            <p className="text-sm mt-2 p-2 bg-white bg-opacity-10 rounded">
              {component.message}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 