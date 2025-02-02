"use client";

import { PricingCard } from './pricing-card';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    description: 'Perfect for small businesses',
    features: [
      'Up to 50 shipments/month',
      'Basic tracking',
      'Document storage',
      'Email support',
      '2 team members'
    ],
    priceId: STRIPE_CONFIG.prices.starter
  },
  {
    name: 'Professional',
    price: '$149',
    description: 'For growing companies',
    features: [
      'Up to 200 shipments/month',
      'Advanced tracking',
      'Document automation',
      'Priority support',
      '5 team members',
      'API access'
    ],
    priceId: STRIPE_CONFIG.prices.professional,
    popular: true
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
      'Custom integrations'
    ],
    priceId: STRIPE_CONFIG.prices.enterprise
  }
];

export function PricingSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that best fits your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}