"use client";

import { Card, CardContent } from '@/components/ui/card';
import { 
  Plane, 
  BarChart, 
  FileText, 
  Bell, 
  Globe, 
  Shield 
} from 'lucide-react';

const features = [
  {
    icon: Plane,
    title: 'Smart Booking',
    description: 'AI-powered route optimization and automated carrier selection'
  },
  {
    icon: BarChart,
    title: 'Analytics Dashboard',
    description: 'Real-time insights and performance metrics'
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Digital AWB and customs documentation handling'
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Proactive notifications for delays and disruptions'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Access to worldwide carrier network and routes'
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Predictive analytics for risk assessment'
  }
];

export function DemoFeatures() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Powerful Features</h2>
        <p className="text-muted-foreground">
          Explore the key features that make LogiAire the leading air cargo management platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
