"use client";

import { loadStripe } from '@stripe/stripe-js';

export const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function createCheckoutSession(priceId: string) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  const { sessionId } = await response.json();
  const stripeInstance = await stripe;
  
  if (stripeInstance) {
    const { error } = await stripeInstance.redirectToCheckout({ sessionId });
    if (error) {
      throw new Error(error.message);
    }
  }
}