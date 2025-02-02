// src/components/routing/dashboard/mapHelpers.ts -->

import { RouteData } from '@/hooks/useRouteDetails';
import mapboxgl from 'mapbox-gl';

export function drawRoute(map: mapboxgl.Map, route: RouteData) {
  // Remove existing route layer if it exists
  if (map.getSource('route')) {
    map.removeLayer('route-layer');
    map.removeSource('route');
  }

  // Add the route source
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.coordinates.map(point => [point.lng, point.lat])
      }
    }
  });

  // Add the route layer
  map.addLayer({
    id: 'route-layer',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3b82f6',
      'line-width': 4
    }
  });

  // Fit the map to the route bounds
  const bounds = new mapboxgl.LngLatBounds();
  route.coordinates.forEach(point => {
    bounds.extend([point.lng, point.lat]);
  });
  
  map.fitBounds(bounds, {
    padding: 50,
    duration: 1000
  });
}