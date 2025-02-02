"use client";

import Image from 'next/image';

export function HeroImage() {
  return (
    <div className="relative animate-float">
      <div className="relative aspect-square max-w-xl mx-auto">
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
          alt="Global logistics"
          width={800}
          height={800}
          className="rounded-lg shadow-2xl"
          priority
        />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-lg animate-float delay-100" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-lg animate-float delay-200" />
      </div>
    </div>
  );
}