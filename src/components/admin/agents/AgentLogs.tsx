import { Card } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Log {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface AgentLogsProps {
  logs: Log[];
}

export function AgentLogs({ logs }: AgentLogsProps) {
  const getLogColor = (level: Log['level']) => {
    switch (level) {
      case 'error':
        return 'text-destructive';
      case 'warn':
        return 'text-yellow-600 dark:text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getLogColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{log.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
} 