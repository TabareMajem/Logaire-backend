"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Ship, Building2, Factory } from 'lucide-react';

const useCases = [
  {
    title: "For Freight Forwarders",
    description: "Streamline operations and boost efficiency with automated documentation and real-time tracking",
    icon: Ship,
    benefits: [
      "Automated documentation",
      "Real-time shipment tracking",
      "Rate optimization",
      "Customer portal access"
    ]
  },
  {
    title: "For Shippers",
    description: "Gain visibility and control over your supply chain with comprehensive shipping solutions",
    icon: Building2,
    benefits: [
      "End-to-end visibility",
      "Cost optimization",
      "Performance analytics",
      "Supplier management"
    ]
  },
  {
    title: "For 3PLs",
    description: "Scale your operations with powerful tools designed for complex logistics needs",
    icon: Factory,
    benefits: [
      "Multi-client management",
      "Custom workflows",
      "API integration",
      "White-label solutions"
    ]
  }
];

export function UseCases() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Who Uses FreightFlow?</h2>
          <p className="text-lg text-muted-foreground">
            Tailored solutions for every logistics professional
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <Icon className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2" />
                        <span className="text-sm">{benefit}</span>
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