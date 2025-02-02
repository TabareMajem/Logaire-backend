"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, DollarSign, Shield } from 'lucide-react';

const benefits = [
  {
    title: 'Increased Efficiency',
    description: 'Reduce manual work by up to 80% with AI-powered automation',
    icon: TrendingUp,
    metric: '80%',
    color: 'text-green-500'
  },
  {
    title: 'Time Savings',
    description: 'Save an average of 15 hours per week on operational tasks',
    icon: Clock,
    metric: '15hrs',
    color: 'text-blue-500'
  },
  {
    title: 'Cost Reduction',
    description: 'Lower operational costs by up to 25% through optimization',
    icon: DollarSign,
    metric: '25%',
    color: 'text-amber-500'
  },
  {
    title: 'Risk Mitigation',
    description: 'Reduce shipping risks and delays by up to 40%',
    icon: Shield,
    metric: '40%',
    color: 'text-purple-500'
  }
];

export function BenefitsSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Real Business Impact</h2>
          <p className="text-lg text-muted-foreground">
            See how FreightFlow transforms your logistics operations
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <div className={`text-3xl font-bold mb-2 ${benefit.color}`}>
                    {benefit.metric}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}