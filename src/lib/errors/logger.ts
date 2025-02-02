
interface ErrorLog {
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: Error;
  context?: Record<string, any>;
  timestamp: Date;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!this.instance) {
      this.instance = new ErrorLogger();
    }
    return this.instance;
  }

  static error(message: string, error?: Error, data?: any): void {
    this.getInstance().log('error', message, error, data);
  }

  static warn(message: string, data?: any): void {
    this.getInstance().log('warn', message, undefined, data);
  }

  static info(message: string, data?: any): void {
    this.getInstance().log('info', message, undefined, data);
  }

  static debug(message: string, data?: any): void {
    this.getInstance().log('debug', message, undefined, data);
  }

  private log(level: LogLevel, message: string, error?: Error, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console[level](message, error || '', data || '');
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    try {
      await fetch('/api/monitoring/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log to monitoring:', error);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = ErrorLogger.getInstance();