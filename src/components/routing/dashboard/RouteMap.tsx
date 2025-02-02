// src/components/routing/dashboard/RouteMap.tsx -->


// src/components/routing/dashboard/RouteMap.tsx
import { useRouteDetails } from '@/hooks/useRouteDetails';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { drawRoute } from './MapHelper';

interface RouteMapProps {
  selectedRoute: string | null;
}

export function RouteMap({ selectedRoute }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { route } = useRouteDetails(selectedRoute);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-day-v1',
        center: [0, 0],
        zoom: 2
      });
    }
  }, []);

  useEffect(() => {
    if (map.current && route) {
      drawRoute(map.current, route);
    }
  }, [route]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

// import { useRouteDetails } from '@/hooks/useRouteDetails';
// import mapboxgl from 'mapbox-gl';
// import { useEffect, useRef } from 'react';

// interface RouteMapProps {
//   selectedRoute: string | null;
// }

// export function RouteMap({ selectedRoute }: RouteMapProps) {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<mapboxgl.Map | null>(null);
//   const { route } = useRouteDetails(selectedRoute);

//   useEffect(() => {
//     if (!map.current && mapContainer.current) {
//       map.current = new mapboxgl.Map({
//         container: mapContainer.current,
//         style: 'mapbox://styles/mapbox/navigation-day-v1',
//         center: [0, 0],
//         zoom: 2
//       });
//     }
//   }, []);

//   useEffect(() => {
//     if (map.current && route) {
//       // Draw route on map
//       drawRoute(map.current, route);
//     }
//   }, [route]);

//   return (
//     <div className="w-full h-[600px] rounded-lg overflow-hidden">
//       <div ref={mapContainer} className="w-full h-full" />
//     </div>
//   );
// } 