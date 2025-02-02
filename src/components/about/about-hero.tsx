"use client";

import Image from 'next/image';

export function AboutHero() {
  return (
    <div className="relative py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Revolutionizing Global Freight Management</h1>
            <p className="text-xl text-muted-foreground mb-6">
              We&apos;re building the future of logistics with AI-powered solutions that make shipping simpler, faster, and more efficient.
            </p>
          </div>
          <div className="relative aspect-video">
            <Image
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
              alt="Global logistics"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}