// src/components/monitoring/alerts/AlertManagementUI.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../components/ui/table';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertSeverity, AlertStatus } from '@/lib/monitoring/alerts/alert-system';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Bell, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function AlertManagementUI() {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | 'all'>('all');
  
  const { alerts, isLoading, error, acknowledgeAlert, resolveAlert } = useAlerts({
    severity: selectedSeverity === 'all' ? undefined : selectedSeverity,
    status: selectedStatus === 'all' ? undefined : selectedStatus
  });

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Alert Management</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity | 'all')}
            className="rounded-md border p-2"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AlertStatus | 'all')}
            className="rounded-md border p-2"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <AlertSeverityBadge severity={alert.severity as 'info' | 'warning' | 'error' | 'critical'} />
                </TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>
                  <AlertStatusBadge status={alert.status} />
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {alert.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function AlertSeverityBadge({ severity }: { severity: AlertSeverity }) {
  const variants = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800'
  };

  return (
    <Badge className={variants[severity]}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const variants = {
    active: 'bg-red-100 text-red-800',
    acknowledged: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800'
  };

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
} 