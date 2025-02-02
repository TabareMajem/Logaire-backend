"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';

const faqs = [
  {
    question: 'How long is the free trial?',
    answer: 'We offer a 14-day free trial on all plans. You can access all features during the trial period with no credit card required.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated for your billing cycle.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and offer invoice payment options for enterprise customers.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees. You only pay the monthly subscription fee for your chosen plan.'
  },
  {
    question: 'What happens if I exceed my shipment limit?',
    answer: 'We\'ll notify you when you\'re approaching your limit. You can either upgrade to a higher plan or pay for additional shipments at a per-shipment rate.'
  }
];

export function PricingFAQ() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Have more questions? Contact our sales team
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}