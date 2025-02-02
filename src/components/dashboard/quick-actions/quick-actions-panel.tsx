"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, FileText, Plus } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'New Shipment',
    description: 'Create a new shipment',
    icon: Plus,
    href: '/dashboard/shipments/new',
    color: 'bg-blue-500'
  },
  {
    title: 'Track Shipment',
    description: 'Track existing shipment',
    icon: Ship,
    href: '/dashboard/shipments',
    color: 'bg-green-500'
  },
  {
    title: 'Documents',
    description: 'Manage documents',
    icon: FileText,
    href: '/dashboard/documents',
    color: 'bg-purple-500'
  }
];

export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${action.color} mr-4`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}