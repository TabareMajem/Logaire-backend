"use client";

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

export function TestimonialCard({ quote, author, role, company, image }: TestimonialCardProps) {
  return (
    <Card className="bg-background">
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-primary mb-4" />
        <p className="text-muted-foreground mb-6">{quote}</p>
        <div className="flex items-center">
          <Image
            src={image}
            alt={author}
            width={48}
            height={48}
            className="rounded-full mr-4"
          />
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-muted-foreground">
              {role}, {company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}