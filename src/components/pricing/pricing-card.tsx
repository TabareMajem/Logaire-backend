"use client";

import { Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { useToast } from '@/hooks/use-toast';

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: string[];
    priceId: string;
    popular?: boolean;
  };
}

export function PricingCard({ plan }: PricingCardProps) {
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession(plan.priceId);
    } catch (error) {
      toast.error('Failed to start checkout process');
    }
  };

  return (
    <Card className={plan.popular ? 'border-primary shadow-lg' : ''}>
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between">
          <span>{plan.name}</span>
          {plan.popular && (
            <span className="text-sm text-primary">Popular</span>
          )}
        </CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-muted-foreground">/month</span>
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
          variant={plan.popular ? 'default' : 'outline'}
          onClick={handleSubscribe}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}