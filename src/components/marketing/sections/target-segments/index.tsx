"use client";

import { Building2, Factory } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const segments = [
  {
    title: 'For SMB Freight Forwarders',
    headline: 'Enterprise Features Without the Enterprise Cost',
    description: 'Replace outdated spreadsheets with AI that handles everything from rate shopping to digital paperwork.',
    icon: Building2,
    benefits: [
      'No huge upfront costs',
      'Easy onboarding process',
      'Scale as you grow',
      'Full feature access'
    ]
  },
  {
    title: 'For Mid-to-Large 3PLs',
    headline: 'Augment Your Existing Systems with AI-Driven Intelligence',
    description: 'Integrate FreightFlow via our robust APIs or direct connectors. Add advanced automation, route optimization, and real-time analytics to your existing workflow.',
    icon: Factory,
    benefits: [
      'Seamless API integration',
      'Custom workflows',
      'Advanced analytics',
      'Enterprise support'
    ]
  }
];

export function TargetSegments() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Built for Your Business</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Solutions tailored to your specific needs
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <Card key={index} className="bg-background">
                <CardContent className="p-8">
                  <Icon className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-sm text-primary font-medium mb-2">{segment.title}</h3>
                  <h4 className="text-2xl font-bold mb-4">{segment.headline}</h4>
                  <p className="text-muted-foreground mb-6">{segment.description}</p>
                  <ul className="space-y-3">
                    {segment.benefits.map((benefit, i) => (
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