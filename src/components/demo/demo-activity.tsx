"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Plane, Package, FileText, Bell } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'shipment',
    icon: Plane,
    message: 'New shipment booked LAX → NRT',
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 2,
    type: 'tracking',
    icon: Package,
    message: 'Shipment SHP001 arrived at customs',
    timestamp: new Date(Date.now() - 1000 * 60 * 45)
  },
  {
    id: 3,
    type: 'document',
    icon: FileText,
    message: 'AWB generated for SHP002',
    timestamp: new Date(Date.now() - 1000 * 60 * 120)
  },
  {
    id: 4,
    type: 'alert',
    icon: Bell,
    message: 'Weather delay warning for DXB route',
    timestamp: new Date(Date.now() - 1000 * 60 * 180)
  }
];

export function DemoActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}