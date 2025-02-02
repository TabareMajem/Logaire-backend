"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Ship, Globe, Search, Clock, BarChart, Shield, Zap, FileText, Users, Database } from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Routing',
    description: 'Optimize routes in real-time using advanced AI algorithms that consider multiple factors like cost, time, and reliability.',
    icon: Ship,
    category: 'core'
  },
  {
    title: 'Smart Rate Management',
    description: 'Get instant access to competitive rates with AI-driven price predictions and optimization.',
    icon: BarChart,
    category: 'core'
  },
  {
    title: 'Real-time Tracking',
    description: 'Track shipments with live updates and proactive notifications for any disruptions.',
    icon: Clock,
    category: 'core'
  },
  {
    title: 'Document Automation',
    description: 'Automate document generation and management with AI-powered data extraction.',
    icon: FileText,
    category: 'automation'
  },
  {
    title: 'Risk Assessment',
    description: 'Proactively identify and mitigate risks using AI risk analysis.',
    icon: Shield,
    category: 'automation'
  },
  {
    title: 'API Integration',
    description: 'Seamlessly integrate with your existing systems through our robust API.',
    icon: Database,
    category: 'integration'
  }
];

export function FeatureGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="relative overflow-hidden border-none bg-gradient-to-br from-background to-muted">
            <CardContent className="p-6">
              <Icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}