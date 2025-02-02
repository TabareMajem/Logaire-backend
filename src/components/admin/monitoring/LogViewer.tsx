import { useState, useEffect } from 'react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API call
      const response = await fetch(`/api/system/logs?level=${logLevel}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [logLevel, autoRefresh]);

  const getLogLevelClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600';
      case 'warn':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={logLevel}
            onValueChange={setLogLevel}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Log Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
        >
          Refresh Now
        </Button>
      </div>

      <ScrollArea className="h-[400px] border rounded-md bg-gray-50">
        <div className="p-4 space-y-2 font-mono text-sm">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-500">No logs found</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex">
                <span className="text-gray-500 mr-4">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className={`${getLogLevelClass(log.level)} uppercase font-semibold mr-4 w-16`}>
                  {log.level}
                </span>
                <span className="text-gray-600 mr-4">[{log.source}]</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}