//src/components/marketing/sections/partners.tsx -->

"use client";

import Image from 'next/image';

const partners = [
  {
    name: "Air France KLM",
    logo: "https://images.unsplash.com/photo-1624571409108-e9d2a098e4e5?w=200&h=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Lufthansa Cargo",
    logo: "https://images.unsplash.com/photo-1624571409108-e9d2a098e4e5?w=200&h=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Emirates SkyCargo",
    logo: "https://images.unsplash.com/photo-1624571409108-e9d2a098e4e5?w=200&h=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Qatar Airways Cargo",
    logo: "https://images.unsplash.com/photo-1624571409108-e9d2a098e4e5?w=200&h=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Turkish Cargo",
    logo: "https://images.unsplash.com/photo-1624571409108-e9d2a098e4e5?w=200&h=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Etihad Cargo",
    logo: "https://images.unsplash.com/photo-1624571409108-e9d2a098e4e5?w=200&h=100&auto=format&fit=crop&q=80"
  }
];

export function PartnersSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Our Partners</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Working with leading airlines worldwide
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center p-4">
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={80}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export function Partners() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Our Partners</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Working with leading airlines worldwide
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center p-4">
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={80}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}