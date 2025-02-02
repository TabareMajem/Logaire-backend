import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';

export function ConnectionStatus() {
  const { isConnected, error } = useMonitoringSocket();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      {error && (
        <span className="text-sm text-red-500">
          {error.message}
        </span>
      )}
    </div>
  );
} 