'use client';

import { useState } from 'react';
import CreateRouteButton from './createRouteButton';
import RouteCard from './routeCard';
import DeleteRouteDialog from './DeleteRouteDialog';
import { TripByIdResponse } from '../../actions/getTripById';
import DestinationList from './destinationsList';
import DestinationForm from './forms/destinationForm';
import LocationMap, { Poi } from './locationMap';

interface TripOverviewClientProps {
  trip: TripByIdResponse;
  tripId: string;
}

type Destination = TripByIdResponse['routes'][0]['destinations'][0];

type CurrentForm = 'destination' | 'accommodation' | 'transportation' | null;

const TripOverviewClient = ({ trip, tripId }: TripOverviewClientProps) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [currentForm, setCurrentForm] = useState<CurrentForm>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [deletingRoute, setDeletingRoute] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const route = trip.routes.find((r) => r.id === selectedRouteId) || null;

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(selectedRouteId === routeId ? null : routeId);
  };

  const handleDeleteRoute = (route: { id: string; name?: string }) => {
    setDeletingRoute(route);
  };

  const onDestinationSelect = (destination: Destination) => {
    setCurrentForm('destination');
    setFormMode('edit');
    setSelectedDestination(destination);
  };

  const locations: Poi[] = trip.routes.flatMap((route) =>
    route.destinations.map((dest) => ({
      key: dest.id,
      location: {
        lat: dest.latitude,
        lng: dest.longitude,
      },
    }))
  );

  return (
    <main className='bg-background min-h-screen'>
      {/* Main Content */}
      <div className='grid h-full grid-cols-4 grid-rows-1'>
        <div
          id='routes-list'
          className='col-span-1 flex h-full flex-col gap-2 border p-4'
        >
          <h4 className='mb-1 text-lg font-medium'>Routes</h4>
          {trip.routes.map((route) => (
            <RouteCard
              key={route.id}
              tripId={tripId}
              route={route}
              isSelected={selectedRouteId === route.id}
              onSelect={() => handleRouteSelect(route.id)}
              onDelete={() =>
                handleDeleteRoute({ id: route.id, name: route.name })
              }
            />
          ))}
          <CreateRouteButton trip={trip} />
        </div>
        {route && (
          <div id='destinations-list' className='col-span-1 border p-4'>
            <h4 className='mb-1 text-lg font-medium'>Destinations</h4>
            <DestinationList
              route={route}
              onDestinationSelect={onDestinationSelect}
            />
          </div>
        )}
        {route && currentForm === 'destination' && (
          <div id='destinations-list' className='col-span-1 border p-4'>
            <h4 className='mb-1 text-lg font-medium'>New Destination</h4>
            <DestinationForm route={route} destinationToEdit={selectedDestination} />
          </div>
        )}
        {route && (
          <div className='col-span-1 border'>
            <LocationMap locations={locations} />
          </div>
        )}
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
