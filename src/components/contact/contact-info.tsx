"use client";

import { Mail, MapPin, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@freightflow.com',
    link: 'mailto:contact@freightflow.com'
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567'
  },
  {
    icon: MapPin,
    title: 'Address',
    value: '123 Logistics Way, San Francisco, CA 94105',
    link: 'https://maps.google.com'
  }
];

export function ContactInfo() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
        <p className="text-lg text-muted-foreground">
          Have questions about FreightFlow? We&apos;re here to help.
        </p>
      </div>

      <div className="space-y-6">
      {contactInfo.map((item) => {
  const Icon = item.icon;
  return (
    <Card key={item.title}>
      <CardContent className="flex items-center space-x-4 p-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{item.title}</h3>
          <a 
            href={item.link}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {item.value}
          </a>
        </div>
      </CardContent>
    </Card>
  );
})}
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-2">Office Hours</h3>
        <p className="text-muted-foreground">
          Monday - Friday: 9:00 AM - 6:00 PM PST<br />
          Saturday - Sunday: Closed
        </p>
      </div>
    </div>
  );
}