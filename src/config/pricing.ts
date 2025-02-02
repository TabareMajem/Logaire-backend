export const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for small businesses',
    featured: false,
    features: [
      'Up to 50 shipments/month',
      'Basic tracking',
      'Document storage',
      'Email support',
      '2 team members'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    description: 'For growing companies',
    featured: true,
    features: [
      'Up to 200 shipments/month',
      'Advanced tracking',
      'Document management',
      'Priority support',
      '5 team members',
      'Analytics dashboard'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    description: 'For large organizations',
    featured: false,
    features: [
      'Unlimited shipments',
      'Custom features',
      'API access',
      'Dedicated support',
      'Unlimited team members',
      'Advanced analytics',
      'Custom integrations'
    ]
  }
];

export const pricingFAQs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, we offer a 14-day free trial on all plans. No credit card required.'
  },
  {
    question: 'What happens if I exceed my shipment limit?',
    answer: 'We\'ll notify you when you\'re close to your limit. You can upgrade your plan or pay for additional shipments.'
  }
];