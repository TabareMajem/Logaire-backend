export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  prices: {
    starter: process.env.STRIPE_PRICE_STARTER!,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE!
  }
};