// src/hooks/useRouteDetails.ts
import { useState, useEffect } from 'react';

interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: RoutePoint[];
  name: string;
  distance: number;
}

export function useRouteDetails(selectedRoute: string | null) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRoute) {
      setRoute(null);
      return;
    }

    const fetchRouteDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulated API call - replace with your actual API endpoint
        // const response = await fetch(`/api/routes/${selectedRoute}`);
        // const data = await response.json();
        
        // For demonstration, using mock data
        const mockRoute: RouteData = {
          coordinates: [
            { lat: 40.7128, lng: -74.0060 }, // New York
            { lat: 39.9526, lng: -75.1652 }, // Philadelphia
            { lat: 38.9072, lng: -77.0369 }  // Washington DC
          ],
          name: "East Coast Route",
          distance: 328.4
        };
        
        setRoute(mockRoute);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch route details');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [selectedRoute]);

  return { route, loading, error };
}

