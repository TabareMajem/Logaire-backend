"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Building2, Factory } from 'lucide-react';

const solutions = [
  {
    title: 'For Air Freight Forwarders',
    headline: 'Streamline Your Air Cargo Operations',
    description: 'Automate bookings, track shipments, and optimize routes with AI-powered tools designed for air freight.',
    icon: Building2,
    benefits: [
      'Automated rate comparison',
      'Real-time capacity updates',
      'Digital documentation',
      'Track & trace'
    ]
  },
  {
    title: 'For Airlines & GSAs',
    headline: 'Optimize Capacity & Boost Revenue',
    description: 'Maximize load factors and streamline operations with intelligent capacity management and booking tools.',
    icon: Factory,
    benefits: [
      'Capacity optimization',
      'Dynamic pricing',
      'Automated bookings',
      'Performance analytics'
    ]
  }
];

export function Solutions() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Solutions for Your Business</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tailored solutions for air cargo professionals
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Card key={index} className="bg-background">
                <CardContent className="p-8">
                  <Icon className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-sm text-primary font-medium mb-2">{solution.title}</h3>
                  <h4 className="text-2xl font-bold mb-4">{solution.headline}</h4>
                  <p className="text-muted-foreground mb-6">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}