'use client';

import { useState } from 'react';
import CreateRouteButton from './createRouteButton';
import RouteCard from './routeCard';
import TripHeader from './tripHeader';
import TripMap from './tripMap';
import DeleteRouteDialog from './DeleteRouteDialog';
import { Database } from '@/lib/supabase/database.types';
import { TripByIdResponse } from '../../hooks/useGetTripById';

interface TripOverviewClientProps {
  trip: TripByIdResponse;
  routes: Database['public']['Tables']['routes']['Row'][];
  tripId: string;
}

const TripOverviewClient = ({
  trip,
  routes,
  tripId,
}: TripOverviewClientProps) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(selectedRouteId === routeId ? null : routeId);
  };

  const handleDeleteRoute = (route: { id: string; name?: string }) => {
    setDeletingRoute(route);
  };

  return (
    <main className='bg-background min-h-screen'>
      {/* Header */}
      <TripHeader trip={trip} />

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left Column - Routes */}
          <div className='space-y-4 lg:col-span-2'>
            <div className='flex items-center justify-between'>
              <h2 className='text-foreground text-xl font-semibold'>Routes</h2>
              <CreateRouteButton trip={trip} />
            </div>

            {routes.length > 0 ? (
              <div className='grid gap-4'>
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    tripId={tripId}
                    isSelected={selectedRouteId === route.id}
                    onSelect={() => handleRouteSelect(route.id)}
                    onDelete={handleDeleteRoute}
                  />
                ))}
              </div>
            ) : (
              <div className='bg-card rounded-lg border py-12 text-center'>
                <p className='text-foreground mb-4'>No routes added yet</p>
                <CreateRouteButton trip={trip} />
              </div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className='lg:col-span-1'>
            <TripMap selectedRouteId={selectedRouteId} routes={routes} />
          </div>
        </div>
      </div>
      <DeleteRouteDialog
        route={deletingRoute}
        tripId={tripId}
        open={!!deletingRoute}
        onOpenChange={(open) => !open && setDeletingRoute(null)}
      />
    </main>
  );
};

export default TripOverviewClient;
