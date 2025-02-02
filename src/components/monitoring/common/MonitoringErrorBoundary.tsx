import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorLogger } from '@/lib/errors/logger';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MonitoringErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorLogger.error('Monitoring component error:', error, {
      componentStack: errorInfo.componentStack
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-red-600">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-500">
              {this.state.error?.message || 'An error occurred while displaying monitoring data'}
            </p>
            <Button onClick={this.handleRetry}>
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
} 