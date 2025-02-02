"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const shipments = [
  {
    id: 'SHP001',
    origin: 'Los Angeles (LAX)',
    destination: 'Tokyo (NRT)',
    status: 'In Transit',
    eta: '2024-03-15',
    type: 'Express'
  },
  {
    id: 'SHP002',
    origin: 'London (LHR)',
    destination: 'Dubai (DXB)',
    status: 'Scheduled',
    eta: '2024-03-16',
    type: 'Standard'
  },
  {
    id: 'SHP003',
    origin: 'Singapore (SIN)',
    destination: 'Sydney (SYD)',
    status: 'Customs',
    eta: '2024-03-14',
    type: 'Express'
  }
];

export function DemoShipments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Shipments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{shipment.id}</span>
                <Badge variant={
                  shipment.status === 'In Transit' ? 'default' :
                  shipment.status === 'Scheduled' ? 'secondary' :
                  'destructive'
                }>
                  {shipment.status}
                </Badge>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{shipment.origin} → {shipment.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>ETA: {format(new Date(shipment.eta), 'MMM d, yyyy')}</span>
                  </div>
                  <Badge variant="outline">{shipment.type}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
