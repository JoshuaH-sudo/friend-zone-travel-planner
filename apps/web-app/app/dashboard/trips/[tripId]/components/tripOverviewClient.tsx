'use client';

import { useState } from 'react';
import CreateRouteButton from './createRouteButton';
import { TripByIdResponse } from '../../actions/getTripById';
import DestinationList from './destinationsList';
import DestinationForm from './forms/destinationForm';
import LocationMap, { Poi } from './locationMap';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import RoutesList from './routesList';

interface TripOverviewClientProps {
  trip: TripByIdResponse;
}

type Destination = TripByIdResponse['routes'][0]['destinations'][0];

type CurrentForm = 'destination' | 'accommodation' | 'transportation' | null;

const TripOverviewClient = ({ trip }: TripOverviewClientProps) => {
  const [currentForm, setCurrentForm] = useState<CurrentForm>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<
    TripByIdResponse['routes'][0] | null
  >(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

  const onDestinationSelect = (destination: Destination | null) => {
    if (!destination) {
      setCurrentForm(null);
      setFormMode('add');
      setSelectedDestination(null);
      return;
    }
    setCurrentForm('destination');
    setFormMode('edit');
    setSelectedDestination(destination);
  };

  const onAddDestinationClick = () => {
    setCurrentForm('destination');
    setFormMode('add');
    setSelectedDestination(null);
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
          <RoutesList
            routes={trip.routes}
            selectedRoute={selectedRoute}
            onRouteSelect={(route) => setSelectedRoute(route)}
          />
          <CreateRouteButton trip={trip} />
        </div>
        {selectedRoute && (
          <div id='destinations-list' className='col-span-1 border p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='mb-1 text-lg font-medium'>Destinations</h4>
              <Button onClick={onAddDestinationClick}>Add</Button>
            </div>
            <DestinationList
              route={selectedRoute}
              onDestinationSelect={onDestinationSelect}
            />
          </div>
        )}
        {selectedRoute && currentForm === 'destination' && (
          <div id='destinations-list' className='col-span-1 border p-4'>
            <h4 className='mb-1 text-lg font-medium'>New Destination</h4>
            <DestinationForm
              route={selectedRoute}
              destinationToEdit={selectedDestination}
            />
          </div>
        )}
        {selectedRoute && (
          <div
            className={cn(
              'border',
              selectedDestination || currentForm === 'destination'
                ? 'col-span-1'
                : 'col-span-2'
            )}
          >
            <LocationMap locations={locations} />
          </div>
        )}
      </div>
    </main>
  );
};

export default TripOverviewClient;
