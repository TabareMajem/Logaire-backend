"use client";

import { Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for small businesses',
    features: [
      'Up to 50 shipments/month',
      'Basic tracking',
      'Document storage',
      'Email support',
      '2 team members'
    ]
  },
  {
    name: 'Professional',
    price: 149,
    description: 'For growing companies',
    featured: true,
    features: [
      'Up to 200 shipments/month',
      'Advanced tracking',
      'Document automation',
      'Priority support',
      '5 team members',
      'Analytics dashboard',
      'API access'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited shipments',
      'Custom features',
      'White-label option',
      'Dedicated support',
      'Unlimited team members',
      'Advanced analytics',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
];

export function PricingPlans() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {plans.map((plan) => (
        <Card 
          key={plan.name} 
          className={plan.featured ? 'border-primary shadow-lg scale-105' : ''}
        >
          <CardHeader>
            <CardTitle className="flex items-baseline gap-x-2">
              <span className="text-2xl font-bold">{plan.name}</span>
              {plan.featured && (
                <span className="text-sm text-primary">Popular</span>
              )}
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
              </span>
              {typeof plan.price === 'number' && (
                <span className="text-muted-foreground">/month</span>
              )}
            </div>
            <p className="text-muted-foreground">{plan.description}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={plan.featured ? 'default' : 'outline'}
              asChild
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}