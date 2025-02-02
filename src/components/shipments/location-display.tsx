// src/components/shipments/location-display.tsx -->

import { MapPin } from 'lucide-react';

interface LocationDisplayProps {
  location: {
    name: string;
    coordinates: [number, number];
  };
}

export function LocationDisplay({ location }: LocationDisplayProps) {
  return (
    <div className="flex items-center space-x-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span className="truncate">{location.name}</span>
    </div>
  );
}