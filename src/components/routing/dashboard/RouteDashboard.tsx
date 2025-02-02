import { useRoutes } from '@/hooks/useRoutes';
import { useState } from 'react';
import { RouteDetails } from './RouteDetails';
import { RouteFilters } from './RouteFilters';
import { RouteList } from './RouteList';
import { RouteMap } from './RouteMap';

export function RouteDashboard() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const { routes, loading, error } = useRoutes();

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <div className="col-span-3">
        <RouteFilters />
        <RouteList 
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
        />
      </div>
      <div className="col-span-9">
        <RouteMap selectedRoute={selectedRoute} />
        {selectedRoute && <RouteDetails routeId={selectedRoute} />}
      </div>
    </div>
  );
} 