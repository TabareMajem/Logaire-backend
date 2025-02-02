"use client";

export function HeroStats() {
  return (
    <div className="flex items-center justify-center lg:justify-start gap-8 animate-fade-in delay-200">
      <div className="text-center hover:scale-105 transition-transform">
        <p className="text-3xl font-bold">200+</p>
        <p className="text-sm text-muted-foreground">Carriers</p>
      </div>
      <div className="text-center hover:scale-105 transition-transform">
        <p className="text-3xl font-bold">10k+</p>
        <p className="text-sm text-muted-foreground">Shipments</p>
      </div>
      <div className="text-center hover:scale-105 transition-transform">
        <p className="text-3xl font-bold">150+</p>
        <p className="text-sm text-muted-foreground">Countries</p>
      </div>
    </div>
  );
}