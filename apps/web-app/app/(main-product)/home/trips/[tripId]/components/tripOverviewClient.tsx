'use client';

import { useState } from 'react';
import CreateRouteButton from './createRouteButton';
import RouteCard from './routeCard';
import TripHeader from './tripHeader';
import TripMap from './tripMap';

interface Trip {
  id: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
}

interface Route {
  id: string;
  name: string;
}

interface TripOverviewClientProps {
  trip: Trip;
  routes: Route[];
  tripId: string;
}

const TripOverviewClient = ({ trip, routes, tripId }: TripOverviewClientProps) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(selectedRouteId === routeId ? null : routeId);
  };

  return (
    <main className='min-h-screen bg-background'>
      {/* Header */}
      <TripHeader trip={trip} />
      
      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Routes */}
          <div className='lg:col-span-2 space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-foreground'>Routes</h2>
              <CreateRouteButton tripId={tripId} />
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
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12 bg-card rounded-lg border'>
                <p className='text-foreground mb-4'>No routes added yet</p>
                <CreateRouteButton tripId={tripId} />
              </div>
            )}
          </div>
          
          {/* Right Column - Map */}
          <div className='lg:col-span-1'>
            <TripMap 
              selectedRouteId={selectedRouteId} 
              routes={routes}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default TripOverviewClient;
