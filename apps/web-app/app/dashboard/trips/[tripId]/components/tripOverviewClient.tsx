'use client';

import { useState } from 'react';
import CreateRouteButton from './createRouteButton';
import { TripByIdResponse } from '../../actions/getTripById';
import DestinationList from './destinationsList';
import DestinationForm from './forms/destinationForm';
import LocationMap, { Poi } from './locationMap';
import { Button } from '@/components/ui/button';
import RoutesList from './routesList';
import AccommodationForm from './forms/accommodationForm';

interface TripOverviewClientProps {
  trip: TripByIdResponse;
}

export type Destination = TripByIdResponse['routes'][0]['destinations'][0];

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

  const onRouteSelect = (route: TripByIdResponse['routes'][0] | null) => {
    setSelectedRoute(route);
    setCurrentForm(null);
    setFormMode('add');
    setSelectedDestination(null);
  };

  const onAddDestinationClick = () => {
    setCurrentForm('destination');
    setFormMode('add');
    setSelectedDestination(null);
  };

  const onAddAccommodationClick = (destination: Destination) => {
    setCurrentForm('accommodation');
    setFormMode('add');
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
    <main className='bg-background h-full'>
      <div className='flex h-full flex-row'>
        <div
          id='routes-list'
          className='flex h-full w-xs flex-col gap-1 border p-4'
        >
          <div className='mb-4 flex items-center justify-between'>
            <h4 className='mb-1 text-lg font-medium'>Routes</h4>
            <CreateRouteButton trip={trip} />
          </div>
          <RoutesList
            routes={trip.routes}
            selectedRoute={selectedRoute}
            onRouteSelect={onRouteSelect}
          />
        </div>
        <div
          id='destinations-list'
          //@ts-expect-error the attribute will still be set
          open={selectedRoute ? true : false}
          className='data=[open=true] flex h-full flex-col gap-1 border transition-all duration-300 ease-in-out not-open:w-0 open:w-xs open:p-4'
        >
          {selectedRoute && (
            <>
              <div className='mb-4 flex items-center justify-between'>
                <h4 className='mb-1 text-lg font-medium'>Destinations</h4>
                <Button onClick={onAddDestinationClick}>
                  + Add Destination
                </Button>
              </div>
              <DestinationList
                route={selectedRoute}
                onDestinationSelect={onDestinationSelect}
                onAddAccommodationClick={onAddAccommodationClick}
              />
            </>
          )}
        </div>
        <div
          id='form-container'
          //@ts-expect-error the attribute will still be set
          open={selectedRoute && currentForm === 'destination'}
          className='data=[open=true] flex h-full flex-col gap-1 border transition-all duration-300 ease-in-out not-open:w-0 open:w-xs open:p-4'
        >
          {selectedRoute && currentForm === 'destination' && (
            <>
              <h4 className='mb-1 text-lg font-medium'>New Destination</h4>
              <DestinationForm
                route={selectedRoute}
                destinationToEdit={selectedDestination}
              />
            </>
          )}
          {selectedDestination && currentForm === 'accommodation' && (
            <>
              <h4 className='mb-1 text-lg font-medium'>New Accommodation</h4>
              <AccommodationForm destination={selectedDestination} />
            </>
          )}
        </div>
        <div className='flex-1'>
          <LocationMap locations={locations} />
        </div>
      </div>
    </main>
  );
};

export default TripOverviewClient;
