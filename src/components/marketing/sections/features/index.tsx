"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Ship, Globe, Search, Clock, BarChart, Shield } from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Routing',
    description: 'Optimize routes with advanced AI algorithms',
    icon: Ship
  },
  {
    title: 'Global Coverage',
    description: 'Connect with carriers worldwide',
    icon: Globe
  },
  {
    title: 'Smart Search',
    description: 'Find the best rates instantly',
    icon: Search
  },
  {
    title: 'Real-time Tracking',
    description: 'Monitor shipments 24/7',
    icon: Clock
  },
  {
    title: 'Analytics',
    description: 'Data-driven insights',
    icon: BarChart
  },
  {
    title: 'Security',
    description: 'Enterprise-grade protection',
    icon: Shield
  }
];

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Powerful Features</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to manage your freight operations efficiently
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-none shadow-none bg-background">
                <CardContent className="p-6">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}