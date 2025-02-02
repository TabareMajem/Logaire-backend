"use client";

import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    title: 'Search & Compare',
    description: 'Find the best routes and rates from multiple airlines instantly',
  },
  {
    title: 'Book & Confirm',
    description: 'Secure cargo space with instant booking confirmation',
  },
  {
    title: 'Track & Monitor',
    description: 'Get real-time updates on your shipment status',
  },
  {
    title: 'Analyze & Optimize',
    description: 'Make data-driven decisions with market insights',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started with CargoAI in four simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}