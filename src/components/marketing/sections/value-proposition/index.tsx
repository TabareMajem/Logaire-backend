"use client";

import { Zap, Gauge, Database, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    title: 'Accelerated Digital Transformation',
    description: 'Instantly access enterprise-grade logistics tools without huge capital expenditure.',
    icon: Zap,
    forType: 'SMBs'
  },
  {
    title: 'AI-Driven Efficiency',
    description: 'Automated route optimization and rate comparisons slash manual work and reduce overhead.',
    icon: Gauge,
    forType: 'All'
  },
  {
    title: 'Single Source of Truth',
    description: 'One platform for rates, bookings, documents, and tracking—reducing complexity and friction.',
    icon: Database,
    forType: 'All'
  },
  {
    title: 'Cost Savings & Scalability',
    description: 'Automated documentation and streamlined workflows mean lower labor costs and fewer errors.',
    icon: TrendingUp,
    forType: '3PLs'
  }
];

export function ValueProposition() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose FreightFlow?</h2>
          <p className="text-lg text-muted-foreground">
            Transform your freight operations with our AI-powered platform
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-muted/5 border-none">
              <CardContent className="p-6">
                <benefit.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
                {benefit.forType !== 'All' && (
                  <span className="inline-block mt-4 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                    Perfect for {benefit.forType}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}